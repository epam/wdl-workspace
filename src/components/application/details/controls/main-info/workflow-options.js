import React from 'react';
import styles from '../../details.css';

export default function ({workflow}) {
  if (!workflow?.metadata?.loaded || !workflow?.metadata?.value?.submittedFiles?.options) {
    return null;
  }
  const {options} = workflow?.metadata?.value?.submittedFiles;
  try {
    const optionsObj = JSON.parse(options);
    if (Object.entries(optionsObj).length === 0 && optionsObj.constructor === Object) {
      return null;
    }
  } catch (_) {
    return null;
  }
  return (
    <code>
      <pre className={styles.workflowOptionsCode}>
        {options}
      </pre>
    </code>
  );
}
