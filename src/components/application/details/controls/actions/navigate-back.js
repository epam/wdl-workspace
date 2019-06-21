export default function ({from, history}) {
  if (!history) {
    return null;
  }
  return () => {
    if (from) {
      history.push(`/runs/${from}`);
    } else {
      history.push('/runs');
    }
  };
}
