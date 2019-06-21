import React from 'react';
import styles from '../workflow-table.css';
import {WorkflowStatusIcon} from '../../../../../utilities';

function WorkflowName({workflow}) {
  let name = workflow.id;
  if (workflow.name) {
    name = `${workflow.name} ${workflow.id.split('-')[0]}`;
  }
  return (
    <span style={{paddingLeft: 10}}>
      {name}
    </span>
  );
}

export default function (statusesFilter) {
  return {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    className: styles.rowName,
    render: (name, item) => (
      <span>
        <WorkflowStatusIcon status={item.status} />
        <WorkflowName workflow={item} />
      </span>
    ),
    ...statusesFilter,
  };
}
