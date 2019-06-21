import {testStatus, WorkflowStatuses} from '../../../utilities/execution-status';

export default function (mode) {
  if (/active/i.test(mode)) {
    return (wf) => testStatus(
      wf.status,
      WorkflowStatuses.running,
      WorkflowStatuses.onHold,
      WorkflowStatuses.aborting,
      WorkflowStatuses.submitted,
    );
  }
  if (/completed/i.test(mode)) {
    return (wf) => testStatus(
      wf.status,
      WorkflowStatuses.succeeded,
      WorkflowStatuses.aborted,
      WorkflowStatuses.failed,
    );
  }
  return () => true;
}
