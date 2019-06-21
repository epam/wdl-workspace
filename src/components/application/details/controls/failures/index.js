import React from 'react';
import {Alert} from 'antd';
import renderFailure from './render-failure';

export default function ({workflow}) {
  if (workflow?.loaded && workflow.metadata?.value?.failures?.length > 0) {
    const {failures} = workflow.metadata.value;
    return (
      <Alert
        type="error"
        style={{marginTop: 5}}
        message={(
          <div>
            {failures.map(renderFailure)}
          </div>
        )}
      />
    );
  }
  return null;
}
