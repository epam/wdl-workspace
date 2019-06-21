export default function (linesCount) {
  const lineNumberMaxDigitsCount = Math.max(`${linesCount}`.length, 3);
  // i.e. '1000' => '000', '10000' => '0000' etc
  return `${(10 ** lineNumberMaxDigitsCount)}`.substring(1);
}
