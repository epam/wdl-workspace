import React from 'react';
import {Col, Row, Icon} from 'antd';
import classNames from 'classnames';
import TaskTimings from './task-timings';
import Task from './task';
import {CallStatusIcon} from '../../../../../utilities';
import styles from '../../../details.css';

const getTaskRowClassName = (details, selected, expanded) => classNames(
  styles.task,
  styles.scatter,
  {
    [styles.details]: details,
    [styles.selected]: selected,
    [styles.expanded]: expanded,
  },
);

export default function (
  {
    details,
    onExpandCollapse,
    task,
    workflow,
  },
) {
  if (!task || !workflow) {
    return null;
  }
  const {
    expanded,
    jobs,
  } = task;
  let renderedJobs = [];
  const selected = (jobs || []).filter(j => j.selected).length > 0;
  if (expanded) {
    renderedJobs = jobs.map(job => (
      <Task
        key={job.jobId}
        details={details}
        isScatterCall
        task={job}
        workflow={workflow}
      />
    ));
  }
  return [
    <Row
      key="scatter"
      className={getTaskRowClassName(details, selected, expanded)}
      type="flex"
      align="middle"
      onClick={() => onExpandCollapse(task.jobId)}
    >
      <Col>
        <Row
          type="flex"
          justify="start"
          align="middle"
          style={{flexWrap: 'nowrap'}}
        >
          <CallStatusIcon status={task.executionStatus} />
          <span className={styles.title}>
            {task.name}
          </span>
          <Icon className={styles.expandIcon} type="down" />
        </Row>
        <TaskTimings details={details} task={task} />
      </Col>
    </Row>,
    ...renderedJobs,
  ];
}
