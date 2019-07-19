import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {computed} from 'mobx';
import dateFns from 'date-fns';
import TaskList from './task-list';
import TaskGraph from './task-graph';
import Logs from '../logs';
import {SplitPanel} from '../../../../utilities';
import styles from '../../details.css';
import {getTaskJobId, taskIsSelectedFn} from '../../utilities';

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

  @computed
  get tasks() {
    const {
      from,
      jobId,
      mode,
      workflow,
    } = this.props;
    if (workflow?.metadata?.loaded && workflow.metadata.value.calls) {
      const {calls} = workflow.metadata.value;
      return Object.keys(calls).map(key => ({
        name: key,
        jobs: calls[key],
      })).reduce((result, current) => {
        result.push(...current.jobs.map((job, index, arr) => ({
          jobId: arr.length === 1 ? current.name : `${current.name}.${index}`,
          rawJobId: arr.length === 1 ? current.name : `${current.name}.${index}`,
          ...job,
          name: current.name,
        })));
        return result;
      }, [])
        .sort((a, b) => dateFns.compareAsc(new Date(a.start), new Date(b.start)))
        .map((task, index, array) => ({
          ...task,
          selected: taskIsSelectedFn({jobId})(task, index, array),
          url: `/run/${workflow.id}/${mode}/${getTaskJobId(task)}${from ? `?from=${from}` : ''}`,
        }));
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
