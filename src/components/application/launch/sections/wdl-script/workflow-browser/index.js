import React from 'react';
import PropTypes from 'prop-types';
import {computed, observable} from 'mobx';
import {inject, observer} from 'mobx-react';
import {
  Alert,
  message,
  Modal,
  Tree,
} from 'antd';
import WorkflowPreview from './workflow-preview';
import Loading from '../../../../../utilities/loading';
import SplitPanel from '../../../../../utilities/split-panel';
import WorkflowListing, {FILE} from '../../../../../../models/workflow-listing';
import {textFileProcessor} from '../../../../../../utils';

import {
  Footer,
  renderWorkflowLibraryNode,
} from './common';

import styles from './workflow-browser.css';
import '../../../../../../static-styles/modal-styles.css';

@inject('filesCache')
@observer
class WorkflowBrowser extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onClose: PropTypes.func,
    onSelectWorkflow: PropTypes.func,
    visible: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    onClose: () => {},
    onSelectWorkflow: () => {},
    visible: false,
  };

  state = {
    elements: [],
    selectedWorkflow: null,
  };

  componentDidMount() {
    this.loadRoot();
  }

  componentWillReceiveProps(nextProps) {
    const {visible} = this.props;
    if (nextProps.visible && nextProps.visible !== visible) {
      this.loadRoot();
    }
  }

  @computed
  get loaded() {
    return this.elementsRequest?.loaded;
  }

  @computed
  get pending() {
    return !this.elementsRequest || this.elementsRequest.pending;
  }

  @computed
  get error() {
    return this.elementsRequest?.error;
  }

  loadRoot = () => {
    this.setState(
      {
        elements: [],
        selectedWorkflow: null,
      },
      () => {
        this.elementsRequest = new WorkflowListing();
        this.elementsRequest.fetch().then(() => {
          if (this.elementsRequest.loaded) {
            this.setState({
              elements: this.elementsRequest.value || [],
            });
          }
        });
      },
    );
  };

  onSubmit = async (selectedWorkflow) => {
    const {downloadUrl, inputs, path} = selectedWorkflow;
    if (!downloadUrl || !path) {
      message.error('WDL path not specified', 5);
    } else {
      const {filesCache, onSelectWorkflow} = this.props;
      const wdlRequest = filesCache.getFileContents(downloadUrl, textFileProcessor);
      await wdlRequest.fetchIfNeededOrWait();
      let inputsRequest;
      if (inputs && inputs.downloadUrl) {
        inputsRequest = filesCache.getFileContents(inputs.downloadUrl, textFileProcessor);
        await inputsRequest.fetchIfNeededOrWait();
      }
      if (wdlRequest.error) {
        message.error(wdlRequest.error, 5);
      } else if (inputsRequest && inputsRequest.error) {
        message.error(inputsRequest.error, 5);
      } else {
        onSelectWorkflow(wdlRequest.value, inputsRequest?.value);
      }
    }
  };

  findElement = (elements, path) => {
    const [result] = elements.filter((e) => e.path === path);
    if (result) {
      return result;
    }
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.children) {
        const childResult = this.findElement(element.children, path);
        if (childResult) {
          return childResult;
        }
      }
    }
    return null;
  };

  onLoadData = (treeNode) => new Promise(async (resolve) => {
    if (treeNode.props.children) {
      resolve();
      return;
    }
    const element = treeNode.props.dataRef;
    const {elements} = this.state;
    const findResult = this.findElement(elements, element.path);
    const request = new WorkflowListing(element.path);
    await request.fetch();
    if (request.loaded) {
      if (findResult) {
        findResult.children = request.value.map((v) => v);
        findResult.loaded = true;
        this.setState({
          elements,
        });
      }
      resolve();
    } else {
      if (findResult) {
        findResult.loaded = true;
        findResult.error = request.error;
        this.setState({
          elements,
        });
      }
      resolve();
    }
  });

  onSelectWorkflow = (key, event) => {
    const {dataRef} = event.node.props;
    if (dataRef.type === FILE) {
      this.setState({
        selectedWorkflow: dataRef,
      });
    }
  };

  @observable elementsRequest;

  renderContent = () => {
    const {elements, selectedWorkflow} = this.state;
    return (
      <SplitPanel
        contentInfo={[
          {
            key: 'TREE',
            size: {
              pxMinimum: 250,
              percentDefault: 33,
            },
          },
        ]}
      >
        <Tree key="TREE" loadData={this.onLoadData} onSelect={this.onSelectWorkflow}>
          {renderWorkflowLibraryNode(elements)}
        </Tree>
        <div key="CONTENT" className={styles.content}>
          <WorkflowPreview
            inputsFile={selectedWorkflow ? selectedWorkflow.inputs : null}
            mdFile={selectedWorkflow ? selectedWorkflow.readme : null}
            wdlFile={selectedWorkflow}
          />
        </div>
      </SplitPanel>
    );
  };

  render() {
    const {disabled, onClose, visible} = this.props;
    const {selectedWorkflow} = this.state;
    return (
      <Modal
        className="workflow-browser-modal"
        visible={visible}
        onCancel={onClose}
        title="Select workflow"
        footer={(
          <Footer
            disabled={disabled}
            onClose={onClose}
            onSubmit={this.onSubmit}
            selectedWorkflow={selectedWorkflow}
          />
        )}
        width="50%"
      >
        {this.pending && !this.loaded ? <Loading /> : undefined}
        {this.error ? <Alert type="error" message={this.error} /> : undefined}
        {this.loaded ? this.renderContent() : undefined}
      </Modal>
    );
  }
}

export default WorkflowBrowser;
