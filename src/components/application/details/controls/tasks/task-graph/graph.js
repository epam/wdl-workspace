import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';

import WdlGraph from '../../../../../utilities/wdl-graph';

@observer
class WorkflowGraph extends Component {
  static propTypes = {
    workflowId: PropTypes.string.isRequired,
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

  get imageSize() {
    if (this._graph) {
      return this._graph.imageSize;
    }
    return {
      width: 1,
      height: 1,
    };
  }

  onGraphReady = (graph) => {
    const {onGraphReady} = this.props;
    this._graph = graph;
    onGraphReady && onGraphReady(graph);
  };

  draw() {
    if (this._graph) {
      this._graph.draw();
    }
  }

  updateData() {
    if (this._graph) {
      this._graph.updateData();
    }
  }

  render() {
    return (
      <WdlGraph
        {...this.props}
        onGraphReady={this.onGraphReady}
      />
    );
  }
}

export default WorkflowGraph;
