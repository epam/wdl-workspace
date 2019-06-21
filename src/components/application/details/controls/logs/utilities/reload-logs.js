import {
  reload,
  testStatus,
  CallStatuses,
} from '../../../../../utilities';

export const UPDATE_CONTENTS_INTERVAL = 5000;

export function reloadLogsIfRunning(
  {
    stderr,
    stdout,
    task,
  },
) {
  if (!task?.executionStatus || !testStatus(
    task?.executionStatus,
    CallStatuses.aborted,
    CallStatuses.failed,
    CallStatuses.succeeded,
  )) {
    if (stdout) {
      stdout.fetch();
    }
    if (stderr) {
      stderr.fetch();
    }
  }
}

export default function reloadLogs(WrappedComponent) {
  return reload(reloadLogsIfRunning, UPDATE_CONTENTS_INTERVAL)(WrappedComponent);
}
