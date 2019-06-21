import React from 'react';
import {Button} from 'antd';

export const ACTION_DETAILS_KEY = 'details';

function detailsFn(event, workflow, callback, details) {
  event.preventDefault();
  event.stopPropagation();
  if (callback) {
    callback(ACTION_DETAILS_KEY, {details: !details, id: workflow.id});
  }
}

export default function (
  {
    callback,
    children,
    options,
    style,
    type,
    workflow,
  },
) {
  if (!workflow) {
    return null;
  }
  const {details} = options || {};
  return (
    <Button
      key="details_switcher"
      size="small"
      type={type}
      style={style}
      onClick={(e) => detailsFn(e, workflow, callback, details)}
    >
      {children || (details ? 'Hide details' : 'Show details')}
    </Button>
  );
}
