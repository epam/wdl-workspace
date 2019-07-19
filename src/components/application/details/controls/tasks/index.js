import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import dateFns from 'date-fns';
import TaskList from './task-list';
import TaskGraph from './task-graph';
import Logs from '../logs';
import getScatterExecutionStatus from './task-list/get-scatter-execution-status';
import {SplitPanel} from '../../../../utilities';
import styles from '../../details.css';

@observer
export default class Tasks extends React.Component {
  static propTypes = {
    details: PropTypes.bool,
    from: PropTypes.string,
    jobId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    mode: PropTypes.string,
    // eslint-disable-next-line
    history: PropTypes.object.isRequired,
    rootUrl: PropTypes.string.isRequired,
    // eslint-disable-next-line
    workflow: PropTypes.object.isRequired,
  };

  static defaultProps = {
    from: null,
    details: false,
    jobId: null,
    mode: 'plain',
  };

  state = {
    expandedKeys: [],
  };

  onExpandCollapse = (key) => {
    const {expandedKeys} = this.state;
    const index = expandedKeys.indexOf(key);
    if (index === -1) {
      expandedKeys.push(key);
    } else if (index >= 0) {
      expandedKeys.splice(index, 1);
    }
    this.setState({expandedKeys});
  };

  get tasks() {
    const {
      from,
      jobId,
      mode,
      workflow,
    } = this.props;
    const {expandedKeys} = this.state;
    if (workflow?.metadata?.loaded && workflow.metadata.value.calls) {
      const {calls} = workflow.metadata.value;
      const result = Object.keys(calls).map(key => {
        const jobs = calls[key] || [];
        if (jobs.length === 1) {
          const job = jobs[0];
          return {
            jobId: key,
            ...job,
            name: key,
            selected: `${key}` === jobId,
            url: `/run/${workflow.id}/${mode}/${key}${from ? `?from=${from}` : ''}`,
          };
        }
        if (jobs.length > 1) {
          const start = jobs
            .map(j => j.start)
            .sort((a, b) => dateFns.compareAsc(new Date(a), new Date(b)))
            .shift();
          const end = jobs
            .map(j => j.end)
            .sort((a, b) => dateFns.compareDesc(new Date(a), new Date(b)))
            .shift();
          return {
            end,
            executionStatus: getScatterExecutionStatus(jobs),
            expanded: expandedKeys.indexOf(key) >= 0,
            jobId: key,
            jobs: jobs
              .slice()
              .sort((a, b) => dateFns.compareAsc(new Date(a.start), new Date(b.start)))
              .map((job, index) => ({
                ...job,
                jobId: `${key}.${index}`,
                name: `Call #${index + 1}`,
                selected: `${key}.${index}` === jobId,
                url: `/run/${workflow.id}/${mode}/${key}.${index}${from ? `?from=${from}` : ''}`,
              })),
            name: key,
            scatter: true,
            start,
          };
        }
        return null;
      })
        .filter(Boolean)
        .sort((a, b) => dateFns.compareAsc(new Date(a.start), new Date(b.start)));
      if (!jobId && result.length > 0) {
        result[0].selected = true;
      }
      return result;
    }
    return [];
  }

  onInitializeTaskGraph = (graph) => {
    this.graph = graph;
    if (this.graph) {
      this.graph.draw();
    }
  };

  renderTasks = () => {
    const {
      details,
      history,
      mode,
      rootUrl,
      workflow,
    } = this.props;
    if (/^plain$/i.test(mode)) {
      return (
        <TaskList
          key="Tasks"
          details={details}
          tasks={this.tasks}
          onExpandCollapse={this.onExpandCollapse}
          workflow={workflow}
        />
      );
    }
    return (
      <TaskGraph
        key="Tasks"
        onInitialized={this.onInitializeTaskGraph}
        rootUrl={rootUrl}
        history={history}
        tasks={this.tasks}
        workflow={workflow}
      />
    );
  };

  render() {
    const {workflow} = this.props;
    return (
      <SplitPanel
        className={styles.splitPanel}
        onPanelResize={() => {
          if (this.graph) {
            this.graph.draw();
          }
        }}
        onPanelResizeDelay={100}
        contentInfo={[
          {
            key: 'Tasks',
            size: {
              pxMinimum: 200,
              percentDefault: 33,
            },
          },
          {
            key: 'Logs',
            size: {
              pxMinimum: 200,
            },
          },
        ]}
      >
        {this.renderTasks()}
        <div key="Logs" className={styles.logContent}>
          <Logs tasks={this.tasks} workflow={workflow} />
        </div>
      </SplitPanel>
    );
  }
}
