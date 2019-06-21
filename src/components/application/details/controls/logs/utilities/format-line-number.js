// formatLineNumber converts a 'number' to string with leading zeros.
// 'mask' is a string with N zeros, where N is a fixed number of digits in a resulted string
export default function (lineIndex, mask) {
  return `${mask}${lineIndex}`.substring(`${lineIndex}`.length);
}
