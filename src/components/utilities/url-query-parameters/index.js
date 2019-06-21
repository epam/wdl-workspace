export default function (location) {
  if (!location) {
    return {};
  }
  const {search} = location;
  if (!search) {
    return {};
  }
  const query = search.startsWith('?') ? search.substring(1) : search;
  return query
    .split('&')
    .map((s) => {
      const [key, value] = s.split('=');
      return {key, value};
    }).reduce((result, curr) => {
      result[curr.key] = curr.value;
      return result;
    }, {});
}
