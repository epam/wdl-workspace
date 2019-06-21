export default function testStatus(test, ...statuses) {
  if (!statuses) {
    return true;
  }
  const regExp = new RegExp(`^(${statuses.join('|')})$`, 'i');
  return regExp.test(test);
}
