import React from 'react';
import {Button, Row} from 'antd';

export default ({
  disabled,
  onClose,
  onSubmit,
  selectedWorkflow,
}) => (
  <Row type="flex" justify="space-between" align="middle">
    <Button disabled={disabled} onClick={onClose}>Cancel</Button>
    <Button
      type="primary"
      onClick={() => onSubmit(selectedWorkflow)}
      disabled={disabled || !selectedWorkflow}
    >
      <span style={{marginRight: 5}}>Select</span>
      {selectedWorkflow ? selectedWorkflow.name : ''}
    </Button>
  </Row>
);
