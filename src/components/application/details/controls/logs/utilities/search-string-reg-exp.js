export default function (searchString) {
  if (!searchString) {
    return null;
  }
  const search = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(${search})`, 'gi');
}
