import React from 'react';
import PropTypes from 'prop-types';
import WorkflowGraph from './graph';

export default class TaskGraph extends React.Component {
  static propTypes = {
    // eslint-disable-next-line
    history: PropTypes.object.isRequired,
    rootUrl: PropTypes.string.isRequired,
    // eslint-disable-next-line
    tasks: PropTypes.array,
    // eslint-disable-next-line
    workflow: PropTypes.object.isRequired,
  };

  static defaultProps = {
    tasks: [],
  };

  componentDidUpdate() {
    const {workflow} = this.props;
    if (!workflow?.loaded && this.graph) {
      this.graph.updateData();
    }
  }

  getTask = ({task}) => {
    const {tasks, workflow} = this.props;
    if (task && task.name) {
      const [taskState] = tasks
        .filter(t => t.name === task.name || t.name === `${workflow.metadata.value.workflowName}.${task.name}`);
      return taskState;
    }
    return null;
  };

  onGraphSelect = (node) => {
    const {
      history,
      rootUrl,
    } = this.props;
    if (node) {
      const task = this.getTask(node);
      if (!task) {
        return;
      }
      history.push(task.url);
    } else {
      history.push(rootUrl);
    }
  };

  getNodeAdditionalInfo = (task) => {
    const taskState = this.getTask(task);
    return {
      status: taskState ? taskState.executionStatus : undefined,
      internalId: taskState ? taskState.jobId : undefined,
      task: taskState,
    };
  };

  onGraphInitialized = (graph) => {
    if (graph) {
      this.graph = graph;
      this.graph.updateData();
    }
  };

  graph;

  render() {
    const {tasks, workflow} = this.props;
    if (!workflow?.metadata?.loaded) {
      return null;
    }
    let [selectedTaskName = ''] = tasks.filter(t => t.selected)
      .map(t => t.name);
    selectedTaskName = selectedTaskName.split('.')
      .pop() || '';
    return (
      <div key="Graph view">
        <WorkflowGraph
          canEdit={false}
          onGraphReady={this.onGraphInitialized}
          onSelect={this.onGraphSelect}
          workflowId={workflow.id}
          selectedTaskName={selectedTaskName}
          getNodeInfo={this.getNodeAdditionalInfo}
        />
      </div>
    );
  }
}
