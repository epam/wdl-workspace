import searchRegExpFn from './search-string-reg-exp';

export function enableEvents(handleSearch, next, prev) {
  window.onkeydown = (e) => {
    if (e.code.toLowerCase() === 'keyf' && (e.ctrlKey || e.metaKey)) {
      handleSearch(true);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (e.code.toLowerCase() === 'keyg' && (e.ctrlKey || e.metaKey)) {
      if (e.shiftKey) {
        prev();
      } else {
        next();
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (e.keyCode === 27) {
      handleSearch(false);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    return true;
  };
}

export function disableEvents() {
  window.onkeydown = null;
}

function stopSearch() {
  return {
    result: {
      searchText: null,
      searchResults: [],
      searchResultIndex: null,
    },
  };
}

export function performSearch(lines, searchText, event) {
  const eventSearchText = event.target.value;
  if (eventSearchText && eventSearchText.length > 0) {
    if (eventSearchText !== searchText) {
      const searchRegExp = searchRegExpFn(eventSearchText);
      if (!searchRegExp) {
        return stopSearch();
      }
      const result = lines
        .map((log) => {
          let findResult = searchRegExp.exec(log.logText);
          const results = [];
          let relativeIndex = 0;
          while (findResult !== null) {
            results.push({...log, relativeIndex});
            relativeIndex += 1;
            findResult = searchRegExp.exec(log.logText);
          }
          return results;
        })
        .filter(a => a.length > 0)
        .reduce((acc, current) => {
          acc.push(...current);
          return acc;
        }, []);
      return {
        result: {
          searchResultIndex: result.length > 0 ? 0 : null,
          searchText: eventSearchText,
          searchResults: result,
        },
      };
    }
    return {
      next: true,
    };
  }
  return stopSearch();
}

export default {
  disableEvents,
  enableEvents,
  performSearch,
};
