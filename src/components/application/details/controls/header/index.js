import React from 'react';
import {WorkflowStatusIcon} from '../../../../utilities';
import styles from '../../details.css';

function renderTitle({workflow}) {
  return (
    <div className={styles.title}>
      <WorkflowStatusIcon status={workflow?.status} />
      <span>
        {workflow?.metadata?.value?.workflowName || workflow?.name}
      </span>
    </div>
  );
}

function renderSubTitle({workflow}) {
  if (!workflow?.metadata?.value?.workflowName) {
    return null;
  }
  return workflow.id;
}


export {
  renderSubTitle as SubTitle,
  renderTitle as Title,
};
