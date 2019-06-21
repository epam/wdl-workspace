import searchRegExpFn from './search-string-reg-exp';
import styles from '../../../details.css';

export default function (text, searchString, isActive, relativeIndex) {
  if (!searchString) {
    return text;
  }
  const searchRegExp = searchRegExpFn(searchString);
  if (!searchRegExp) {
    return text;
  }
  let index = 0;
  return text
    .split(searchRegExp)
    .map((part) => {
      if (searchRegExp.test(part)) {
        const className = isActive && index === relativeIndex
          ? styles.searchResultsActive
          : styles.searchResultsDefault;
        index += 1;
        return `<span class="${className}">${part}</span>`;
      }
      return part;
    }).join('');
}
