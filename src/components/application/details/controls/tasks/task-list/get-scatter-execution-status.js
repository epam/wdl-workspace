import {CallStatuses, testStatus} from '../../../../../utilities';

export default function (jobs) {
  const count = (jobs || []).length;
  if ((jobs || []).filter(j => testStatus(j.executionStatus, CallStatuses.failed)).length > 0) {
    return CallStatuses.failed;
  }
  if ((jobs || []).filter(j => testStatus(j.executionStatus, CallStatuses.aborted)).length > 0) {
    return CallStatuses.aborted;
  }
  if ((jobs || []).filter(j => testStatus(j.executionStatus, CallStatuses.running)).length > 0) {
    return CallStatuses.running;
  }
  if ((jobs || []).filter(j => testStatus(j.executionStatus, CallStatuses.waitingForReturnCode)).length > 0) {
    return CallStatuses.waitingForReturnCode;
  }
  if ((jobs || []).filter(j => testStatus(j.executionStatus, CallStatuses.onHold)).length === count) {
    return CallStatuses.onHold;
  }
  if ((jobs || [])
    .filter(j => testStatus(j.executionStatus, CallStatuses.succeeded)).length === count) {
    return CallStatuses.succeeded;
  }
  return CallStatuses.submitted;
}
