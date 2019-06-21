import React from 'react';
import Task from './task';
import styles from '../../../details.css';

export default function ({details, tasks, workflow}) {
  return (
    <div key="Tasks list">
      <div className={styles.taskList}>
        {tasks.map(task => <Task key={task.jobId} details={details} task={task} workflow={workflow} />)}
        {tasks.length === 0 ? <i>No tasks found</i> : undefined}
      </div>
    </div>
  );
}
