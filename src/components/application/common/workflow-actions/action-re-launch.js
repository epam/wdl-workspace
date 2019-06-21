import React from 'react';
import {Button} from 'antd';
import {testStatus, WorkflowStatuses} from '../../../utilities';

export const ACTION_RELAUNCH_KEY = 'relaunch';

function relaunch(event, workflow, history, callback) {
  event.preventDefault();
  event.stopPropagation();
  if (history) {
    history.push(`/relaunch-workflow/${workflow?.id}`);
  }
  if (callback) {
    callback(ACTION_RELAUNCH_KEY, {navigated: !!history, id: workflow.id});
  }
}

export default function (
  {
    callback,
    children,
    history,
    style,
    type,
    workflow,
  },
) {
  if (!workflow) {
    return null;
  }
  const {status} = workflow;
  if (!!status && !testStatus(
    status,
    WorkflowStatuses.aborting,
    WorkflowStatuses.onHold,
    WorkflowStatuses.running,
    WorkflowStatuses.submitted,
  )) {
    return (
      <Button
        key="relaunch"
        size="small"
        type={type || 'primary'}
        style={style}
        onClick={(e) => relaunch(e, workflow, history, callback)}
      >
        {children || 'Relaunch'}
      </Button>
    );
  }
  return null;
}
