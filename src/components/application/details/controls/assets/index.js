import React from 'react';
import {Collapse} from 'antd';
import renderAssetsPanel from './assets-panel';
import '../../../../../static-styles/collapse-panel.css';
import styles from '../../details.css';

export default function (
  {
    routes,
    workflow,
  },
) {
  if (!workflow?.metadata?.loaded) {
    return null;
  }
  const {inputs, outputs} = workflow.metadata.value;
  const panels = [
    renderAssetsPanel({
      assets: inputs,
      assetClassName: styles.inputRow,
      className: styles.inputs,
      header: 'Inputs',
      routes,
      workflow,
    }),
    renderAssetsPanel({
      assets: outputs,
      assetClassName: styles.outputRow,
      className: styles.outputs,
      header: 'Outputs',
      routes,
      workflow,
    }),
  ].filter(Boolean);
  if (panels.length > 0) {
    return (
      <Collapse
        className="workflow-assets"
        style={{marginTop: 5}}
      >
        {panels}
      </Collapse>
    );
  }
  return null;
}
