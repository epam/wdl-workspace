import React from 'react';
import TaskRenderer from './task-renderer-selector';
import styles from '../../../details.css';

export default function (
  {
    details,
    onExpandCollapse,
    tasks,
    workflow,
  },
) {
  return (
    <div key="Tasks list">
      <div className={styles.taskList}>
        {tasks.map(task => (
          <TaskRenderer
            key={task.jobId}
            details={details}
            onExpandCollapse={onExpandCollapse}
            task={task}
            workflow={workflow}
          />
        ))}
        {tasks.length === 0 ? <i>No tasks found</i> : undefined}
      </div>
    </div>
  );
}
