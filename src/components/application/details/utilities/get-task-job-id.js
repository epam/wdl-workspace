export default function (task, explicit = false) {
  return (`${task.jobId || (!explicit ? task.name || '' : '')}`).split('\n')[0];
}
