import React from 'react';
import Task from './task';
import Scatter from './scatter';

export default function (
  {
    details,
    onExpandCollapse,
    task,
    workflow,
  },
) {
  if (task.scatter) {
    return (
      <Scatter
        task={task}
        details={details}
        onExpandCollapse={onExpandCollapse}
        workflow={workflow}
      />
    );
  }
  return (
    <Task task={task} details={details} workflow={workflow} />
  );
}
