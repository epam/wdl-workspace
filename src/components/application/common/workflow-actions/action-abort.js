import React from 'react';
import {
  Button,
  Icon,
  message,
  Modal,
} from 'antd';
import Abort from '../../../../models/workflow/actions/abort';
import {testStatus, WorkflowStatuses} from '../../../utilities';

export const ACTION_ABORT_KEY = 'abort';

function abortWFRunConfirm(event, workflow, callback) {
  event.preventDefault();
  event.stopPropagation();
  Modal.confirm({
    title: `Are you sure you want to abort execution of the ${workflow.name || workflow.id}?`,
    style: {
      wordWrap: 'break-word',
    },
    icon: <Icon type="question-circle" style={{fontSize: 45}} theme="twoTone" twoToneColor="#f5222d" />,
    onOk: async () => {
      const hide = message.loading('Aborting...');
      const request = new Abort(workflow.id);
      await request.send({});
      const {error} = request;
      hide();
      if (error) {
        message.error(error);
      }
      if (callback) {
        callback(ACTION_ABORT_KEY, {error, id: workflow.id});
      }
    },
    okText: 'Abort',
    cancelText: 'Cancel',
  });
}

export default function (
  {
    callback,
    children,
    workflow,
    style,
    type,
  },
) {
  if (!workflow) {
    return null;
  }
  const {status} = workflow;
  if (testStatus(
    status,
    WorkflowStatuses.onHold,
    WorkflowStatuses.running,
    WorkflowStatuses.submitted,
  )) {
    return (
      <Button
        key="abort"
        size="small"
        type={type || 'danger'}
        style={style}
        onClick={(e) => abortWFRunConfirm(e, workflow, callback)}
      >
        {children || 'Abort'}
      </Button>
    );
  }
  return null;
}
