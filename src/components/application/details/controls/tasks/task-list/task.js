import React from 'react';
import {Link} from 'react-router-dom';
import {Col, Row} from 'antd';
import classNames from 'classnames';
import TaskTimings from './task-timings';
import {getTaskJobId} from '../../../utilities';
import {CallStatusIcon} from '../../../../../utilities';
import styles from '../../../details.css';

const getTaskRowClassName = (details, selected) => classNames(
  styles.task,
  {
    [styles.details]: details,
    [styles.selected]: selected,
  },
);

export default function ({details, task, workflow}) {
  if (!task || !workflow) {
    return null;
  }
  const taskJobId = getTaskJobId(task, true);
  return (
    <Link
      key={task.key}
      to={task.url}
    >
      <Row
        className={getTaskRowClassName(details, task.selected)}
        type="flex"
        align="middle"
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
            <span>
              {/* eslint-disable-next-line */}
              {isNaN(taskJobId) ? '' : `(#${taskJobId})`}
            </span>
          </Row>
          <TaskTimings details={details} task={task} />
        </Col>
      </Row>
    </Link>
  );
}
