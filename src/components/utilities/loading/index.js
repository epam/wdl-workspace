import React from 'react';
import {Row, Spin} from 'antd';

export default function () {
  return (
    <Row type="flex" justify="center" align="middle" style={{height: '100%', width: '100%'}}>
      <Spin />
    </Row>
  );
}
