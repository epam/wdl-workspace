import renderLabel from './workflow-label';

export default function ({workflow}) {
  if (!workflow?.metadata?.loaded) {
    return null;
  }
  const {labels1} = workflow.metadata.value;
  const labelEntries = Object.entries(labels1 || {});
  if (labelEntries.length === 0) {
    return null;
  }
  return labelEntries.map(renderLabel);
}
