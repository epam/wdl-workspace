import React from 'react';
import {Button} from 'antd';

export const ACTION_TIMINGS_KEY = 'details';

function timings(event, workflow, callback) {
  event.preventDefault();
  event.stopPropagation();
  window.open(workflow?.timingsUrl);
  if (callback) {
    callback(ACTION_TIMINGS_KEY, {id: workflow.id});
  }
}

export default function (
  {
    callback,
    style,
    type,
    workflow,
  },
) {
  if (!workflow?.timingsUrl) {
    return null;
  }
  return (
    <Button
      key="timings"
      size="small"
      type={type}
      style={style}
      onClick={(e) => timings(e, workflow, callback)}
    >
      Show timings
    </Button>
  );
}
