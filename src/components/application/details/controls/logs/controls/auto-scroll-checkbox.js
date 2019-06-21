import React from 'react';
import {Checkbox, Row} from 'antd';
import styles from '../../../details.css';
import {CallStatuses, testStatus} from '../../../../../utilities/execution-status';

export default function ({autoScroll, onChange, task}) {
  if (!testStatus(
    task?.executionStatus,
    CallStatuses.aborted,
    CallStatuses.failed,
    CallStatuses.succeeded,
  )) {
    return (
      <Row
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          textAlign: 'right',
          zIndex: 2,
          paddingTop: 10,
          paddingRight: 15,
        }}
      >
        <Checkbox
          className={styles.scrollToLastCheckBox}
          onChange={onChange}
          checked={autoScroll}
        >
          Follow log
        </Checkbox>
      </Row>
    );
  }
  return null;
}
