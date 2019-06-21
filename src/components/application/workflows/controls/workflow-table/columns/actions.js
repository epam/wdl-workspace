import React from 'react';
import styles from '../workflow-table.css';

import {
  Abort,
  Details,
  ReLaunch,
  ReleaseOnHold,
} from '../../../../common/workflow-actions';

function Actions(
  {
    callback,
    item,
  },
) {
  return [
    <ReleaseOnHold
      key="release on hold"
      callback={callback}
      type="link"
      workflow={item}
    >
      Release on hold
    </ReleaseOnHold>,
    <Abort
      key="abort"
      callback={callback}
      workflow={item}
      type="link"
      style={{color: 'red'}}
    />,
    <ReLaunch
      callback={callback}
      key="relaunch"
      type="link"
      workflow={item}
    />,
    <Details
      callback={callback}
      key="details"
      type="link"
      workflow={item}
    >
      Details
    </Details>,
  ];
}

export default function (callback) {
  return {
    title: '',
    key: 'actions',
    className: styles.rowActions,
    width: 300,
    render: (item) => <Actions item={item} callback={callback} />,
  };
}
