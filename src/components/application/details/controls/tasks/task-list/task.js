import React from 'react';
import {Link} from 'react-router-dom';
import {Col, Row} from 'antd';
import classNames from 'classnames';
import TaskTimings from './task-timings';
import {CallStatusIcon} from '../../../../../utilities';
import styles from '../../../details.css';

const getTaskRowClassName = (details, selected, isScatterCall) => classNames(
  styles.task,
  {
    [styles.details]: details,
    [styles.selected]: selected,
    [styles.scatterCall]: isScatterCall,
  },
);

export default function (
  {
    details,
    isScatterCall,
    task,
    workflow,
  },
) {
  if (!task || !workflow) {
    return null;
  }
  return (
    <Link to={task.url}>
      <Row
        className={getTaskRowClassName(details, task.selected, isScatterCall)}
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
          </Row>
          <TaskTimings details={details} task={task} />
        </Col>
      </Row>
    </Link>
  );
}
