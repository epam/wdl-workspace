import React from 'react';
import {
  Alert,
  Collapse,
  List,
} from 'antd';
import styles from '../../styles.css';

export default function ({errors}) {
  if (!errors || !errors.length) {
    return null;
  }
  return (
    <Collapse style={{marginTop: 5}}>
      <Collapse.Panel key="issues" header={`${errors.length} issues found in the script`} className={styles.scriptErrorPanel}>
        <Alert
          className={styles.errorAlert}
          message={undefined}
          type="warning"
          description={(
            <List
              size="small"
              dataSource={errors}
              renderItem={item => <List.Item>{item}</List.Item>}
            />
          )}
        />
      </Collapse.Panel>
    </Collapse>
  );
}
