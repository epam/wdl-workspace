import React from 'react';
import {Icon} from 'antd';
import WorkflowStatuses from './workflow-statuses';
import testStatus from './test-execution-status';

const WorkflowStatusIcon = ({status}) => {
  let iconType = '';
  let iconTheme = 'twoTone';
  let twoToneColor = '';
  if (testStatus(status, WorkflowStatuses.aborting, WorkflowStatuses.submitted)) {
    iconType = 'loading';
    iconTheme = 'outlined';
    twoToneColor = 'outlined';
  } else if (testStatus(status, WorkflowStatuses.aborted, WorkflowStatuses.failed)) {
    iconType = 'exclamation-circle';
    twoToneColor = '#f5222d';
  } else if (testStatus(status, WorkflowStatuses.succeeded)) {
    iconType = 'check-circle';
    twoToneColor = '#52c41a';
  } else if (testStatus(status, WorkflowStatuses.onHold)) {
    iconType = 'pause-circle';
    twoToneColor = '#ffe58f';
  } else {
    iconType = 'play-circle';
    twoToneColor = '#32aaff';
  }
  return <Icon type={iconType} theme={iconTheme} twoToneColor={twoToneColor} />;
};

export default WorkflowStatusIcon;
