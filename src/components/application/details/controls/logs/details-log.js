/* eslint-disable react/no-danger */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import {computed} from 'mobx';
import {AutoSizer, List} from 'react-virtualized';
import classNames from 'classnames';
import {
  AutoScrollCheckbox,
  LogLine,
  SearchControl,
} from './controls';
import {
  formatLineNumber,
  getLineNumberMask,
  hightlight,
  logsProcessor,
  reloadLogs,
  Search,
} from './utilities';
import styles from '../../details.css';

@inject('ansiUp', 'filesCache')
@inject(({ansiUp, filesCache}, props) => ({
  ansiUp,
  stdout: filesCache.getExecutionFileContents(props.stdoutPath, logsProcessor),
  stderr: filesCache.getExecutionFileContents(props.stderrPath, logsProcessor),
}))
@reloadLogs
@observer
class DetailsLog extends Component {
  static propTypes = {
    stdoutPath: PropTypes.string,
    stderrPath: PropTypes.string,
    // eslint-disable-next-line
    predefinedLogs: PropTypes.array,
    // eslint-disable-next-line
    task: PropTypes.object.isRequired,
  };

  static defaultProps = {
    stdoutPath: undefined,
    stderrPath: undefined,
    predefinedLogs: [],
  };

  state = {
    searching: false,
    searchText: null,
    searchResults: [],
    searchResultIndex: null,
    autoScroll: true,
  };

  componentDidMount() {
    Search.enableEvents(
      this.handleSearch,
      this.next,
      this.prev,
    );
  }

  componentDidUpdate() {
    const {stdout, stderr} = this.props;
    if (stdout) {
      stdout.onDataReceived = () => this.onDataReceived();
    }
    if (stderr) {
      stderr.onDataReceived = () => this.onDataReceived();
    }
    this.recomputeRowHeights();
  }

  componentWillUnmount() {
    Search.disableEvents();
  }

  @computed
  get lines() {
    const {
      ansiUp,
      stdout,
      stderr,
      predefinedLogs,
    } = this.props;
    let lines = [
      predefinedLogs.length > 0 ? 'EXECUTION EVENTS:' : false,
      ...predefinedLogs,
    ].filter(Boolean);
    if (stdout?.loaded && (stdout.value || []).length > 0) {
      lines = [
        ...lines,
        'STDOUT LOG:',
        ...stdout.value,
      ];
    }
    if (stderr?.loaded && (stderr.value || []).length > 0) {
      lines = [
        ...lines,
        'STDERR LOG:',
        ...stderr.value,
      ];
    }
    if (lines.length === 0) {
      lines = ['No data'];
    }
    return lines.map((line, index) => ({
      error: hightlight.isError(line),
      lineIndex: index,
      log: line,
      logText: ansiUp.ansi_to_text(line),
      warning: hightlight.isWarning(line),
    }));
  }

  getRowHeight = ({index}) => {
    if (!this.lines || !this.hiddenSpan) {
      return 30;
    }
    this.hiddenSpan.innerHTML = this.lines[index].logText;
    const spanHeight = (this.hiddenSpan.offsetHeight || 30) + 16;

    return Math.max(spanHeight, 30);
  };

  recomputeRowHeights = () => {
    if (this.listElement) {
      this.listElement.recomputeRowHeights();
    }
  };

  initializeHiddenSpan = (span) => {
    if (span) {
      this.hiddenSpan = span;
      this.recomputeRowHeights();
    }
  };

  initializeList = (element) => {
    this.listElement = element;
  };

  renderLogRow = (formatLineNumberFn) => ({index, style}) => {
    const {
      error,
      logText,
      warning,
    } = this.lines[index];
    const {ansiUp} = this.props;
    const {
      searching,
      searchResultIndex,
      searchResults,
      searchText,
    } = this.state;

    let lineIndex = null;
    let relativeIndex = null;
    if (searching && searchResultIndex !== null
      && searchResults.length > searchResultIndex) {
      lineIndex = searchResults[searchResultIndex].lineIndex;
      relativeIndex = searchResults[searchResultIndex].relativeIndex;
    }
    return (
      <div key={index} style={style} className={styles.logRow}>
        <span
          className={classNames(
            styles.number,
            {
              [styles.error]: error,
              [styles.warning]: warning,
            },
          )}
        >
          {formatLineNumberFn(index + 1)}
          :
        </span>
        <LogLine
          active={index === lineIndex}
          ansiUp={ansiUp}
          className={classNames(
            {
              [styles.error]: error,
              [styles.warning]: warning,
            },
          )}
          text={logText}
          relativeIndex={relativeIndex}
          searchPattern={searching ? searchText : null}
        />
      </div>
    );
  };

  onDataReceived = () => {
    const {autoScroll} = this.state;
    if (this.listElement && this.lines && this.lines.length > 0 && autoScroll) {
      this.listElement.scrollToRow((this.lines || []).length - 1);
    }
  };

  performSearch = (event) => {
    const {searchText} = this.state;
    const {next, result} = Search.performSearch(this.lines, searchText, event);
    if (result) {
      this.setState(result);
    }
    if (next) {
      this.next();
    }
  };

  next = () => {
    const {searchResultIndex, searchResults} = this.state;
    if (searchResults.length > 0) {
      let index = (searchResultIndex || 0) + 1;
      if (index >= searchResults.length) {
        index = 0;
      }
      const {lineIndex} = searchResults[index];
      this.setState({searchResultIndex: index}, () => {
        if (this.listElement) {
          this.listElement.scrollToRow(lineIndex);
        }
      });
    }
  };

  prev = () => {
    const {searchResultIndex, searchResults} = this.state;
    if (searchResults.length > 0) {
      let index = (searchResultIndex || 0) - 1;
      if (index < 0) {
        index = searchResults.length - 1;
      }
      const {lineIndex} = searchResults[index];
      this.setState({searchResultIndex: index}, () => {
        if (this.listElement) {
          this.listElement.scrollToRow(lineIndex);
        }
      });
    }
  };

  handleSearch = (searching) => {
    this.setState({
      searching,
    });
  };

  handleAutoScrollChange = (e) => {
    this.setState({autoScroll: e.target.checked});
  };

  hiddenSpan;

  render() {
    const {
      autoScroll,
      searchResultIndex,
      searching,
      searchResults,
      searchText,
    } = this.state;
    const {task} = this.props;
    const lineNumberMask = getLineNumberMask(this.lines.length);
    const formatLineNumberFn = (index) => formatLineNumber(index, lineNumberMask);
    return (
      <div>
        <SearchControl
          searchResultIndex={searchResultIndex}
          next={this.next}
          onClose={() => this.handleSearch(false)}
          onSearch={this.performSearch}
          prev={this.prev}
          searchText={searchText}
          searchResults={searchResults}
          visible={searching}
        />
        <div
          className={
            classNames(
              styles.logsTableContainer,
              {[styles.search]: searching},
            )
          }
        >
          <AutoScrollCheckbox
            autoScroll={autoScroll}
            onChange={this.handleAutoScrollChange}
            task={task}
          />
          <div className={styles.hidden}>
            <span className={styles.number}>
              {formatLineNumberFn(0)}
              :
            </span>
            <span ref={this.initializeHiddenSpan} />
          </div>
          <AutoSizer onResize={this.recomputeRowHeights}>
            {({width, height}) => (
              <List
                ref={this.initializeList}
                className={styles.logsTable}
                height={height}
                rowHeight={this.getRowHeight}
                rowCount={this.lines.length}
                rowRenderer={this.renderLogRow(formatLineNumberFn)}
                width={width}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }
}

export default DetailsLog;
