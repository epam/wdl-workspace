import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {computed, observable} from 'mobx';
import {inject, observer} from 'mobx-react';
import {
  Alert,
  AutoComplete,
  Row,
  Button,
  Icon,
  Input,
  message,
  Popover,
  Tooltip,
} from 'antd';
import classNames from 'classnames';
import pipeline from 'pipeline-builder';
import {Loading} from '..';
import {textFileProcessor} from '../../../utils';

import 'pipeline-builder/dist/pipeline.css';
import styles from './wdl-graph.css';

const graphFitContentOpts = {padding: 24};

const graphSelectableTypes = [
  'VisualGroup', 'VisualStep', 'VisualWorkflow',
];

const blobProcessorFn = async blob => textFileProcessor(blob);

@inject('filesCache')
@inject(({history, workflowCache}, {workflowId}) => ({
  workflow: workflowId ? workflowCache.getWorkflow(workflowId) : null,
  history,
}))
@observer
export default class WdlGraph extends Component {
  static propTypes = {
    workflowId: PropTypes.string,
    wdlScript: PropTypes.string,
    selectedTaskName: PropTypes.string,
    onSelect: PropTypes.func,
    className: PropTypes.string,
    fitAllSpace: PropTypes.bool,
    onGraphReady: PropTypes.func,
    getNodeInfo: PropTypes.func,
    hideError: PropTypes.bool,
    canEdit: PropTypes.bool,
    onGraphUpdated: PropTypes.func,
  };

  static defaultProps = {
    workflowId: null,
    wdlScript: null,
    selectedTaskName: '',
    onSelect: null,
    className: '',
    fitAllSpace: true,
    onGraphReady: null,
    getNodeInfo: null,
    hideError: false,
    canEdit: true,
    onGraphUpdated: null,
  };

  state = {
    canZoomIn: false,
    canZoomOut: false,
    error: false,
    fullScreen: false,
    modified: false,
  };

  wdlVisualizer = null;

  workflow = null;


  @observable
  previousSuccessfulCode = null;

  @observable
  itemEditForm = null;

  @observable
  workflowUrlScriptRequest = null;

  componentDidMount() {
    const {onGraphReady} = this.props;
    onGraphReady && onGraphReady(this);
    this.loadWorkflowUrlScript();
  }

  componentDidUpdate() {
    this.loadWorkflowUrlScript();
  }

  get editable() {
    const {canEdit} = this.props;

    return canEdit;
  }

  @computed
  get graphSearchDataSource() {
    return this.getGraphFilteredElements().map(this.renderOption);
  }

  @computed
  get mainScript() {
    const {workflow, wdlScript} = this.props;
    if (wdlScript && wdlScript.length) {
      return wdlScript;
    }
    let script = null;
    if (!workflow || !workflow.loaded) {
      return script;
    }
    if (workflow.metadata.loaded && workflow.metadata.value.submittedFiles) {
      if (workflow.metadata.value.submittedFiles.workflow) {
        script = workflow.metadata.value.submittedFiles.workflow;
      } else if (this.workflowUrlScriptRequest && this.workflowUrlScriptRequest.loaded) {
        script = this.workflowUrlScriptRequest.value || null;
      }
    }

    return script;
  }

  loadWorkflowUrlScript = async () => {
    const {workflow, filesCache, wdlScript} = this.props;
    if ((wdlScript && wdlScript.length)
      || !workflow || !workflow.loaded || !workflow.metadata.value.submittedFiles.workflowUrl) {
      return;
    }

    if (workflow.metadata.value.submittedFiles.workflowUrl) {
      this.workflowUrlScriptRequest = filesCache.getFileContents(
        workflow.metadata.value.submittedFiles.workflowUrl,
        blobProcessorFn,
      );
    }
  };

  initializeContainer = async (container) => {
    if (container) {
      const {workflow} = this.props;
      this.wdlVisualizer = new pipeline.Visualizer(container);
      this.wdlVisualizer.paper.on('cell:pointerclick', this.onSelectItem);
      this.wdlVisualizer.paper.on('blank:pointerclick', this.onSelectItem);
      this.wdlVisualizer.paper.on('link:connect', this.modelChanged);
      this.wdlVisualizer.paper.model.on('remove', this.modelChanged);
      if (this.mainScript
        || (workflow && workflow.metadata.value && !workflow.metadata.value.submittedFiles.workflowUrl)) {
        await this.applyCode(this.mainScript, true);
      }
    } else {
      if (this.wdlVisualizer) {
        this.wdlVisualizer.paper.off('link:connect', this.modelChanged);
        this.wdlVisualizer.paper.model.off('remove', this.modelChanged);
        this.wdlVisualizer.paper.off('cell:pointerclick', this.onSelectItem);
        this.wdlVisualizer.paper.off('blank:pointerclick', this.onSelectItem);
      }
      this.wdlVisualizer = null;
    }
  };

  applyCode = async (code = '', clearModifiedConfig) => {
    const hide = message.loading('Loading...');
    const onError = (msg) => {
      if (clearModifiedConfig) {
        this.setState({
          selectedElement: null,
          error: msg,
        });
      } else {
        this.setState({
          selectedElement: null,
          error: msg,
        });
      }
    };
    try {
      const parseResult = await pipeline.parse(code);
      if (parseResult.status) {
        this.workflow = parseResult.model[0];
        this.clearWrongPorts(this.workflow);
        this.previousSuccessfulCode = code;
        this.wdlVisualizer.attachTo(this.workflow);
        this.updateData();
        if (clearModifiedConfig) {
          this.setState({
            selectedElement: null,
            canZoomIn: true,
            canZoomOut: true,
            error: null,
          });
        } else {
          this.setState({
            selectedElement: null,
            canZoomIn: true,
            canZoomOut: true,
            error: null,
          });
        }
        this.onFullScreenChanged();
      } else {
        onError(parseResult.message);
      }
    } catch (e) {
      onError(e);
    } finally {
      hide();
    }
  };

  updateData = () => {
    const {selectedTaskName, getNodeInfo} = this.props;
    this.wdlVisualizer && this.wdlVisualizer.paper.model.getElements().forEach((e) => {
      const view = this.wdlVisualizer.paper.findViewByModel(e);
      if (selectedTaskName && e.step && e.step.name === selectedTaskName
        && graphSelectableTypes.includes(e.attributes.type)) {
        this.wdlVisualizer.disableSelection();
        this.wdlVisualizer.enableSelection();
        this.wdlVisualizer.selection.push(e);
        view && view.el && view.el.classList.toggle('selected', true);
      }
      if (view && view.el && e.step.type !== 'workflow') {
        if (!view.el.classList.contains(styles.wdlTask)) {
          view.el.classList.add(styles.wdlTask);
        }
        if (!view.el.dataset) {
          view.el.dataset = {};
        }
        let status;
        if (getNodeInfo) {
          const info = getNodeInfo({task: {name: e.step.name || (e.step.action || {}).name}});
          if (info) {
            status = info.status;
          }
        }
        if (e.step.action && e.step.action.data
          && e.step.action.data.runtime && !!e.step.action.data.runtime.pipeline) {
          if (!view.el.classList.contains(styles.wdlPipelineTask)) {
            view.el.classList.add(styles.wdlPipelineTask);
          }
        }
        if (status) {
          view.el.dataset.taskstatus = status.toLowerCase();
        } else {
          delete view.el.dataset.taskstatus;
        }
      }
    });
  };

  clearWrongPorts = (step) => {
    if (step.i) {
      const keys = Object.keys(step.i || {});
      for (let vIndex = 0; vIndex < keys.length; vIndex++) {
        const variable = keys[vIndex];
        if (Object.hasOwnProperty.call(step.i, variable) && step.i[variable].inputs) {
          const inputsToRemove = [];
          for (let i = 0; i < step.i[variable].inputs.length; i++) {
            if (!step.i[variable].inputs[i].from || step.i[variable].inputs[i].from === '') {
              inputsToRemove.push(step.i[variable].inputs[i]);
            }
          }
          for (let i = 0; i < inputsToRemove.length; i++) {
            const index = step.i[variable].inputs.indexOf(inputsToRemove[i]);
            if (index >= 0) {
              step.i[variable].inputs.splice(index, 1);
            }
          }
        }
      }
    }
    if (step.children) {
      const childrenKeys = Object.keys(step.children || {});
      for (let childIndex = 0; childIndex < childrenKeys.length; childIndex++) {
        const child = childrenKeys[childIndex];
        if (Object.hasOwnProperty.call(step.children, child)) {
          this.clearWrongPorts(step.children[child]);
        }
      }
    }
  };

  onSelectItem = () => {
    const {onSelect} = this.props;
    const {selectedElement} = this.state;
    if ((this.wdlVisualizer.selection[0] || {}).step === selectedElement) {
      return;
    }
    if (this.wdlVisualizer && this.wdlVisualizer.selection
      && this.wdlVisualizer.selection[0] && this.wdlVisualizer.selection[0].step) {
      this.setState({selectedElement: this.wdlVisualizer.selection[0].step},
        () => {
          // eslint-disable-next-line react/destructuring-assignment
          onSelect && onSelect({task: {name: this.state.selectedElement.name}});
        });
    } else {
      onSelect && onSelect(null);
      this.setState(
        {selectedElement: null},
      );
    }
  };

  /* eslint-disable no-underscore-dangle */
  fitToSelectedItem = () => {
    if (this.wdlVisualizer && this.wdlVisualizer.selection
      && this.wdlVisualizer.selection[0]) {
      const getOffset = (el) => {
        el = el.getBoundingClientRect();
        return {
          left: el.left + window.scrollX,
          top: el.top + window.scrollY,
        };
      };
      const offset = getOffset(this.wdlVisualizer.paper.el);
      this.wdlVisualizer.paper.setOrigin(0, 0);
      this.wdlVisualizer.paper.scale(1, 1);
      this.wdlVisualizer.zoom._currDeg = 0;
      const paperSize = this.wdlVisualizer.paper.clientToLocalPoint({
        x: this.wdlVisualizer.paper.options.width + offset.left,
        y: this.wdlVisualizer.paper.options.height + offset.top,
      });
      const zoomLevel = 0.75; // we want selected element to take 75% of visualizer's size
      const desiredSize = {x: paperSize.x * zoomLevel, y: paperSize.y * zoomLevel};
      const elementSize = this.wdlVisualizer.paper.clientToLocalPoint({
        x: this.wdlVisualizer.selection[0].attributes.size.width + offset.left,
        y: this.wdlVisualizer.selection[0].attributes.size.height + offset.top,
      });
      const scale = Math.min(1, desiredSize.x / elementSize.x, desiredSize.y / elementSize.y);
      const degree = Math.log(scale) / Math.log(this.wdlVisualizer.zoom._mult) - this.wdlVisualizer.zoom._currDeg;
      const elementPosition = this.wdlVisualizer.selection[0].attributes.position;
      this.wdlVisualizer.paper.setOrigin(
        (-elementPosition.x + paperSize.x / 2.0 - elementSize.x / 2.0),
        (-elementPosition.y + paperSize.y / 2.0 - elementSize.y / 2.0),
      );
      this.wdlVisualizer.zoom._scale(degree, {
        x: this.wdlVisualizer.paper.options.width / 2.0 + offset.left,
        y: this.wdlVisualizer.paper.options.height / 2.0 + offset.top,
      });
    }
  };
  /* eslint-enable */

  modelChanged = () => {
    this.setState({modified: true});
  };

  draw = () => {
    this.onFullScreenChanged();
  };

  onFullScreenChanged = () => {
    if (this.wdlVisualizer) {
      const parent = this.wdlVisualizer.paper.el.parentElement;
      if (parent) {
        this.wdlVisualizer.paper.setDimensions(parent.offsetWidth, parent.offsetHeight);
      }
      this.wdlVisualizer.zoom.fitToPage(graphFitContentOpts);
    }
  };

  zoomIn = () => {
    if (this.wdlVisualizer) {
      this.wdlVisualizer.zoom.zoomIn();
    }
  };

  zoomOut = () => {
    if (this.wdlVisualizer) {
      this.wdlVisualizer.zoom.zoomOut();
    }
  };

  revertChanges = async () => {
    if (this.mainScript) {
      await this.applyCode(this.mainScript);
      this.setState(
        {modified: false, selectedElement: null},
      );
    }
  };

  toggleLinks = () => {
    let {showAllLinks} = this.state;
    showAllLinks = !showAllLinks;
    this.setState({showAllLinks}, () => {
      this.wdlVisualizer && this.wdlVisualizer.paper.model.off('remove', this.modelChanged);
      this.wdlVisualizer && this.wdlVisualizer.togglePorts(true, showAllLinks);
      setTimeout(() => {
        this.wdlVisualizer && this.wdlVisualizer.paper.model.on('remove', this.modelChanged);
      }, 100);
    });
  };

  fitGraph = () => {
    this.wdlVisualizer && this.wdlVisualizer.zoom.fitToPage(graphFitContentOpts);
  };

  layoutGraph = () => {
    this.wdlVisualizer && this.wdlVisualizer.layout() && this.fitGraph();
  };

  selectElement = (label, option) => {
    const {name} = option.props.step;
    this.wdlVisualizer && this.wdlVisualizer.paper.model.getElements().forEach((e) => {
      if (name && e.step && e.step.name === name && graphSelectableTypes.includes(e.attributes.type)) {
        const view = this.wdlVisualizer.paper.findViewByModel(e);
        this.wdlVisualizer.disableSelection();
        this.wdlVisualizer.enableSelection();
        this.wdlVisualizer.selection.push(e);
        view && view.el && view.el.classList.toggle('selected', true);
        this.onSelectItem();
        this.fitToSelectedItem();
      }
    });
  };

  getGraphFilteredElements = (element = this.workflow) => {
    const {graphSearch} = this.state;
    const elements = [];
    if (!graphSearch) {
      return [];
    }
    const childrenKeys = Object.keys(element.children || {});
    for (let keyIndex = 0; keyIndex < childrenKeys.length; keyIndex++) {
      const key = childrenKeys[keyIndex];
      if (Object.hasOwnProperty.call(element.children, key)) {
        if (key.toLowerCase().includes(graphSearch.toLowerCase())
          || (element.children[key].type || 'task').toLowerCase().includes(graphSearch.toLowerCase())) {
          elements.push({
            alias: element.children[key].name,
            type: element.children[key].type || 'task',
            step: element.children[key],
          });
        }
        if (element.children[key].children && Object.keys(element.children[key].children || {}).length) {
          const childEls = this.getGraphFilteredElements(element.children[key].children);
          if (childEls.length) {
            elements.concat(childEls);
          }
        }
      }
    }

    return elements;
  };

  renderOption = (item) => {
    let expression = '';
    if (item.type.toLowerCase() === 'if' || item.type.toLowerCase() === 'while'
      || item.type.toLowerCase() === 'scatter') {
      if (item.step && item.step.action
        && item.step.action.data && item.step.action.data.expression) {
        expression = `(${item.step.action.data.expression})`;
      }
    } else {
      expression = item.alias;
    }
    return (
      <AutoComplete.Option key={item.alias} value={item.alias} step={item.step}>
        {item.type} {expression}
      </AutoComplete.Option>
    );
  };

  clearSearchAutocomplete = () => {
    this.setState({graphSearch: null});
  };

  onSearchChange = (graphSearch) => {
    this.setState({graphSearch});
  };

  onTooltipVisibleChange = (tooltipVisible) => {
    this.setState({tooltipVisible});
  };

  handleSearchControlVisible = (searchControlVisible) => {
    const handleChange = () => {
      this.setState({searchControlVisible, tooltipVisible: false}, () => {
        if (!searchControlVisible) {
          this.clearSearchAutocomplete();
        }
      });
    };
    if (!searchControlVisible) {
      setTimeout(handleChange, 300);
    } else {
      handleChange();
    }
  };

  renderGraphSearch = () => {
    const {searchControlVisible, tooltipVisible, graphSearch} = this.state;
    const searchControl = (
      <AutoComplete
        dataSource={this.graphSearchDataSource}
        value={graphSearch}
        onChange={this.onSearchChange}
        placeholder="Element type or name..."
        optionLabelProp="value"
        style={{minWidth: 300}}
        onSelect={this.selectElement}
      >
        <Input.Search />
      </AutoComplete>
    );
    return (
      <Tooltip
        title="Search element"
        onVisibleChange={this.onTooltipVisibleChange}
        visible={tooltipVisible}
        placement="right"
      >
        <Popover
          content={searchControl}
          placement="right"
          trigger="click"
          onVisibleChange={this.handleSearchControlVisible}
          visible={searchControlVisible}
        >
          <Button
            id="wdl-graph-search-button"
            className={styles.wdlAppearanceButton}
            shape="circle"
          >
            <Icon type="search" />
          </Button>
        </Popover>
      </Tooltip>
    );
  };

  toggleFullScreen = () => {
    const {fullScreen} = this.state;
    this.setState({fullScreen: !fullScreen},
      () => this.onFullScreenChanged());
  };

  renderAppearancePanel = () => {
    const {
      canZoomIn,
      canZoomOut,
      fullScreen,
      modified,
      showAllLinks,
    } = this.state;
    return (
      <div className={classNames(styles.wdlGraphSidePanel, styles.left)}>
        {
          this.editable
          && (
            <Tooltip title="Save" placement="right">
              <Button
                id="wdl-graph-save-button"
                className={classNames(styles.wdlAppearanceButton, styles.active, styles.noFade)}
                disabled={!modified}
                type="primary"
                shape="circle"
                onClick={this.openCommitFormDialog}
              >
                <Icon type="save" />
              </Button>
            </Tooltip>
          )
        }
        {
          this.editable
          && (
            <Tooltip title="Revert changes" placement="right">
              <Button
                id="wdl-graph-revert-button"
                className={classNames(styles.wdlAppearanceButton, styles.noFade)}
                disabled={!modified}
                shape="circle"
                onClick={() => this.revertChanges()}
              >
                <Icon type="reload" />
              </Button>
            </Tooltip>
          )
        }
        {
          this.editable
          && <div className={styles.separator}>{'\u00A0'}</div>
        }
        <Tooltip title="Layout" placement="right">
          <Button
            className={styles.wdlAppearanceButton}
            id="wdl-graph-layout-button"
            shape="circle"
            onClick={this.layoutGraph}
          >
            <Icon type="appstore-o" />
          </Button>
        </Tooltip>
        <Tooltip title="Fit to screen" placement="right">
          <Button
            className={styles.wdlAppearanceButton}
            id="wdl-graph-fit-button"
            shape="circle"
            onClick={this.fitGraph}
          >
            <Icon type="scan" />
          </Button>
        </Tooltip>
        <Tooltip
          title={showAllLinks ? 'Hide links' : 'Show links'}
          placement="right"
        >
          <Button
            className={classNames(styles.wdlAppearanceButton, {[styles.active]: showAllLinks})}
            type={showAllLinks ? 'primary' : 'default'}
            id={`wdl-graph-${showAllLinks ? 'hide-links' : 'show-links'}-button`}
            shape="circle"
            onClick={this.toggleLinks}
          >
            <Icon type="swap" />
          </Button>
        </Tooltip>
        <Tooltip title="Zoom out" placement="right">
          <Button
            className={styles.wdlAppearanceButton}
            id="wdl-graph-zoom-out-button"
            shape="circle"
            onClick={this.zoomOut}
            disabled={!canZoomOut}
          >
            <Icon type="minus-circle-o" />
          </Button>
        </Tooltip>
        <Tooltip title="Zoom in" placement="right">
          <Button
            className={styles.wdlAppearanceButton}
            id="wdl-graph-zoom-in-button"
            shape="circle"
            onClick={this.zoomIn}
            disabled={!canZoomIn}
          >
            <Icon type="plus-circle-o" />
          </Button>
        </Tooltip>
        {
          this.renderGraphSearch()
        }
        <Tooltip title="Fullscreen" placement="right">
          <Button
            className={styles.wdlAppearanceButton}
            id="wdl-graph-fuulscreen-button"
            shape="circle"
            onClick={this.toggleFullScreen}
          >
            <Icon type={fullScreen ? 'shrink' : 'arrows-alt'} />
          </Button>
        </Tooltip>
      </div>
    );
  };

  renderGraph = () => {
    const {workflow, wdlScript} = this.props;
    const {error} = this.state;
    if (!wdlScript && ((workflow && workflow.pending && !workflow.loaded)
      || (workflow && workflow.metadata.value.submittedFiles.workflowUrl && !this.mainScript
        && this.workflowUrlScriptRequest && !this.workflowUrlScriptRequest.loaded
        && !this.workflowUrlScriptRequest.error))) {
      return <Loading />;
    }
    if ((workflow && workflow.error)
      || (this.workflowUrlScriptRequest && this.workflowUrlScriptRequest.error)) {
      let errorMessage;
      let errorDescription;
      if (workflow && workflow.error) {
        errorMessage = workflow.error;
      } else if (this.workflowUrlScriptRequest && this.workflowUrlScriptRequest.error) {
        errorMessage = `An error occurred while loading the script from the '${this.workflowUrlScriptRequest}'`;
        errorDescription = `${this.workflowUrlScriptRequest.error}`;
      }
      return <Alert type="warning" message={errorMessage} description={errorDescription} />;
    }
    if (error) {
      const errorMessage = error.message || error;
      const errorContent = (
        <Row>
          <Row><b>Error parsing wdl script:</b></Row>
          <Row>{errorMessage}</Row>
        </Row>
      );
      return (
        <Alert
          type="warning"
          message={errorContent}
        />
      );
    }
    return (
      <div
        className={styles.wdlGraph}
        onDragEnter={e => e.preventDefault()}
        onDragOver={e => e.preventDefault()}
      >
        {this.renderAppearancePanel()}
        <div className={styles.wdlGraphContainer}>
          <div ref={this.initializeContainer} />
        </div>
      </div>
    );
  };

  render() {
    const {fullScreen} = this.state;
    const {className} = this.props;
    let containerClassName = fullScreen ? styles.graphContainerFullScreen : styles.graphContainer;
    if (className) {
      containerClassName = className;
    }
    return (
      <div className={containerClassName}>
        {this.renderGraph()}
      </div>
    );
  }
}
