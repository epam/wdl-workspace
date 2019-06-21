import {testStatus, WorkflowStatuses} from '../../../utilities';

const WORKFLOW_RELOAD_INTERVAL = 5000;

export {WORKFLOW_RELOAD_INTERVAL};

export async function reloadWorkflowIfRunning(
  {
    from,
    jobId,
    launching,
    mode,
    history,
    workflow,
  },
) {
  if (!workflow) {
    return null;
  }
  if (workflow?.error && launching) {
    // Workflow is launching, not submitted yet
    return workflow.reload();
  }
  const {status} = workflow;
  if (testStatus(
    status,
    WorkflowStatuses.running,
    WorkflowStatuses.aborting,
    WorkflowStatuses.submitted,
  )) {
    // Workflow is submitted and is running.
    // We should update
    await workflow.reload();
    if (launching && history) {
      const jobIdPath = jobId ? `/${jobId}` : '';
      const fromParam = from ? `from=${from}` : null;
      const queryParams = [fromParam].filter(Boolean);
      const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      history.push(`/run/${workflow.id}/${mode || 'plain'}${jobIdPath}${query}`);
    }
  }
  return null;
}
