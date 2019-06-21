import React from 'react';
import {Button, Row} from 'antd';
import {downloadFile} from '../../../../utilities';

export default function renderValue({routes, value, workflow}) {
  if (!workflow?.metadata?.loaded || !workflow.metadata.value?.workflowRoot) {
    return value;
  }
  const {workflowRoot} = workflow.metadata.value;
  if (Array.isArray(value)) {
    const renderSingleValue = (line, index) => (
      <Row key={`${line}_${index}`}>{renderValue(line)}</Row>
    );
    return (
      <div>
        {value.map(renderSingleValue)}
      </div>
    );
  }
  if (workflowRoot && routes.executionsConfigured) {
    const result = (new RegExp(`^${workflowRoot}/(.*)$`)).exec(value);
    if (result) {
      return (
        <Button
          type="link"
          onClick={() => downloadFile(value)}
          style={{paddingBottom: 15}}
        >
          {result[1]}
        </Button>
      );
    }
  }
  return value;
}
