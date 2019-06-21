export function isError(text) {
  const parts = text.toLowerCase().split(/[ :,.!~?[\]()\\=+*@#/]/);
  return parts.indexOf('error') >= 0 || parts.indexOf('fail') >= 0 || parts.indexOf('fatal') >= 0;
}

export function isWarning(text) {
  const parts = text.toLowerCase().split(/[ :,.!~?[\]()\\=+*@#/]/);
  return parts.indexOf('warning') >= 0;
}

export default {
  isError,
  isWarning,
};
