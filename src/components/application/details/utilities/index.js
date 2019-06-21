import {
  reloadWorkflowIfRunning,
  WORKFLOW_RELOAD_INTERVAL,
} from './reload-workflow-if-running';

import {reload} from '../../../utilities';

export function reloadWorkflow(WrappedComponent) {
  return reload(reloadWorkflowIfRunning, WORKFLOW_RELOAD_INTERVAL)(WrappedComponent);
}

export {reload};
export {default as getTaskJobId} from './get-task-job-id';
export {default as taskIsSelectedFn} from './task-selection-state';
