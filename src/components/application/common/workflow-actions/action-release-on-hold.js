import React from 'react';
import {Button, message} from 'antd';
import ReleaseHold from '../../../../models/workflow/actions/release-hold';
import {testStatus, WorkflowStatuses} from '../../../utilities';

export const ACTION_RELEASE_ON_HOLD_KEY = 'release on hold';

async function releaseOnHold(event, workflow, callback, history, options) {
  event.preventDefault();
  event.stopPropagation();
  const hide = message.loading('Starting...');
  const request = new ReleaseHold(workflow.id);
  await request.send({});
  const {error} = request;
  hide();
  if (error) {
    message.error(error);
  } else {
    const {from, mode} = options || {};
    if (history) {
      if (from) {
        history.push(`/run/${workflow.id}/${mode || 'plain'}?from=${from}&launching=true`);
      } else {
        history.push(`/run/${workflow.id}/${mode || 'plain'}?launching=true`);
      }
    }
    if (callback) {
      callback(ACTION_RELEASE_ON_HOLD_KEY, {navigated: !!history, id: workflow.id});
    }
  }
}

export default function (
  {
    callback,
    children,
    history,
    workflow,
    options,
    style,
    type,
  },
) {
  if (!workflow) {
    return null;
  }
  const {status} = workflow;
  if (testStatus(status, WorkflowStatuses.onHold)) {
    return (
      <Button
        key="release"
        size="small"
        type={type || 'primary'}
        style={style}
        onClick={(e) => releaseOnHold(e, workflow, callback, history, options)}
      >
        {children || 'Launch'}
      </Button>
    );
  }
  return null;
}
