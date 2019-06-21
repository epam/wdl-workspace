import React from 'react';
import {Icon, Row, Tabs} from 'antd';

export default function (
  {
    onChange,
    status,
  },
) {
  return (
    <Tabs activeKey={status} onChange={onChange}>
      <Tabs.TabPane
        key="active"
        tab={(
          <Row type="flex" align="middle" style={{fontSize: 'larger'}}>
            <Icon
              theme={status === 'active' ? 'twoTone' : undefined}
              type="play-circle"
            />
            Active
          </Row>
        )}
      />
      <Tabs.TabPane
        key="completed"
        tab={(
          <Row type="flex" align="middle" style={{fontSize: 'larger'}}>
            <Icon
              theme={status === 'completed' ? 'twoTone' : undefined}
              type="check-circle"
            />
            Completed
          </Row>
        )}
      />
      <Tabs.TabPane
        key="all"
        tab={(
          <Row type="flex" align="middle" style={{fontSize: 'larger'}}>
            <Icon
              theme={status === 'all' ? 'twoTone' : undefined}
              type="profile"
            />
            All
          </Row>
        )}
      />
    </Tabs>
  );
}
