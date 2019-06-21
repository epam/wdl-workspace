import React from 'react';
import {Button, Row} from 'antd';
import {Section} from '../common';

export default function ({disabled, ready, onSubmit}) {
  return (
    <Section
      complete={ready}
      icon="check-circle"
      title="Submission"
    >
      <Row type="flex" justify="space-around">
        <Button
          type="primary"
          disabled={disabled}
          onClick={onSubmit}
        >
          Launch
        </Button>
      </Row>
    </Section>
  );
}
