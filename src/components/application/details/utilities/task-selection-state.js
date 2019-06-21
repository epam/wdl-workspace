import getTaskJobId from './get-task-job-id';

function taskIsSelected(task, props) {
  return getTaskJobId(task) === props.jobId || task.rawJobId === props.jobId;
}

export default function (props) {
  return (task, index, array) => taskIsSelected(task, props)
    || array.length === 1 ||
    (index === 0 && !props.jobId);
}
