import React from 'react';
import dateFns from 'date-fns';
import styles from '../workflow-table.css';
import {WorkflowStatuses} from '../../../../../utilities';

function RunningTime({item}) {
  const renderTime = () => {
    if (item.end && item.start && item.status !== WorkflowStatuses.running) {
      const time = dateFns.distanceInWords(new Date(item.end), new Date(item.start), {includeSeconds: true});
      return <span>{time}</span>;
    }
    if (item.start) {
      const time = dateFns.distanceInWords(new Date(), new Date(item.start), {includeSeconds: true});
      const timeString = `Running for: ${time}`;
      return <span>{timeString}</span>;
    }
    return null;
  };
  return renderTime();
}

export default function () {
  return {
    title: 'Elapsed',
    key: 'runningTime',
    className: styles.rowElapsedTime,
    render: item => <RunningTime item={item} />,
  };
}
