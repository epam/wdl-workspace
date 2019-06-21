import {reload} from '../../../utilities';

export const WORKFLOWS_RELOAD_INTERVAL_MS = 5000;

export function reloadWorkflowsFn({workflows}) {
  return workflows.fetch();
}

export default function (WrappedComponent) {
  return reload(reloadWorkflowsFn, WORKFLOWS_RELOAD_INTERVAL_MS)(WrappedComponent);
}
