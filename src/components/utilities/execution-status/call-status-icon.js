import React from 'react';
import {Icon} from 'antd';
import CallStatuses from './call-statuses';
import testStatus from './test-execution-status';

const CallStatusIcon = ({status}) => {
  let iconType = '';
  const iconTheme = 'twoTone';
  let twoToneColor = '';
  if (testStatus(status, CallStatuses.aborted, CallStatuses.failed)) {
    iconType = 'exclamation-circle';
    twoToneColor = '#f5222d';
  } else if (testStatus(status, CallStatuses.succeeded)) {
    iconType = 'check-circle';
    twoToneColor = '#52c41a';
  } else if (testStatus(status, CallStatuses.running, CallStatuses.waitingForReturnCode)) {
    iconType = 'play-circle';
    twoToneColor = '#32aaff';
  } else {
    iconType = 'pause-circle';
    twoToneColor = '#ffe58f';
  }

  return <Icon type={iconType} theme={iconTheme} twoToneColor={twoToneColor} />;
};

export default CallStatusIcon;
