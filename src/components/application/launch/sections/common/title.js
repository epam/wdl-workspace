export default ({workflow}) => {
  if (workflow) {
    if (workflow.loaded) {
      return `Re-launch ${workflow.name}`;
    }
    if (workflow.error) {
      return `Re-launch workflow (${workflow.error})`;
    }
    return 'Re-launch workflow';
  }
  return 'Launch workflow';
};
