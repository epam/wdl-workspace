import React from 'react';
import MainInfoEntity from './main-info-entity';
import WorkflowLabels from './workflow-labels';
import WorkflowOptions from './workflow-options';
import {displayDate} from '../../../../../utils';
import styles from '../../details.css';

export default function ({workflow}) {
  if (!workflow?.metadata?.loaded) {
    return null;
  }
  const {value: metadata} = workflow.metadata;
  const mainInfo = [
    <MainInfoEntity
      key="Submission time"
      name="Submission time"
      value={displayDate(metadata.submission)}
    />,
    <MainInfoEntity
      key="Start time"
      name="Start time"
      value={displayDate(metadata.start)}
    />,
    <MainInfoEntity
      key="End time"
      name="End time"
      value={displayDate(metadata.end)}
    />,
    <MainInfoEntity
      key="Status"
      name="Status"
      value={metadata.status}
    />,
    <MainInfoEntity
      key="Actual workflow language"
      name="Actual workflow language"
      value={metadata.actualWorkflowLanguage}
    />,
    <MainInfoEntity
      key="Actual workflow language version"
      name="Actual workflow language version"
      value={metadata.actualWorkflowLanguageVersion}
    />,
    <MainInfoEntity
      key="Workflow root"
      name="Workflow root"
      value={metadata.workflowRoot}
    />,
    <MainInfoEntity
      key="Labels"
      name="Labels"
    >
      <WorkflowLabels workflow={workflow} />
    </MainInfoEntity>,
    <MainInfoEntity
      key="Configuration options"
      name="Configuration options"
    >
      <WorkflowOptions workflow={workflow} />
    </MainInfoEntity>,
  ].filter(Boolean);
  return (
    <div className={styles.mainInfo}>
      <table>
        <tbody>
          {mainInfo}
        </tbody>
      </table>
    </div>
  );
}
