import React from 'react';
import {Row} from 'antd';
import dateFns from 'date-fns';
import styles from '../../../details.css';
import {displayDate} from '../../../../../../utils';
import {CallStatuses} from '../../../../../utilities';

export default function ({details, task}) {
  if (!task || !details) {
    return null;
  }
  const info = [];
  const completed = task.end && task.executionStatus !== CallStatuses.running;
  const runningTime = dateFns.distanceInWords(
    completed ? new Date(task.end) : new Date(),
    new Date(task.start),
    {includeSeconds: true},
  );
  if (task.start) {
    info.push(
      <Row key="started" className={styles.timeInfo}>
        <span>
          <b>Started:</b> {displayDate(task.start)}
        </span>
        <br />
      </Row>,
    );
    info.push(
      <Row key="finished" className={styles.timeInfo}>
        <span>
          <b>
            {completed ? 'Finished' : 'Running for'}
            :
          </b>
          <span>{displayDate(task.end)} ({runningTime})</span>
        </span>
        <br />
      </Row>,
    );
  }
  return info;
}
