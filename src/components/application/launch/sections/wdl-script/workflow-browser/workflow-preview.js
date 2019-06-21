import React from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import Remarkable from 'remarkable';
import hljs from 'highlight.js';
import {
  Alert,
} from 'antd';
import Loading from '../../../../../utilities/loading';
import {textFileProcessor} from '../../../../../../utils';
import styles from './workflow-browser.css';

const MarkdownRenderer = new Remarkable('full', {
  html: true,
  xhtmlOut: true,
  breaks: false,
  langPrefix: 'language-',
  linkify: true,
  linkTarget: '',
  typographer: true,
  highlight: (str, lang) => {
    lang = lang || 'bash';
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {
        return '';
      }
    }
    try {
      return hljs.highlightAuto(str).value;
    } catch (__) {
      return '';
    }
  },
});

const FilePathProps = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({downloadUrl: PropTypes.string, path: PropTypes.string}),
]);

const getFileContents = (path, filesCache) => {
  if (!path) {
    return null;
  }
  if (typeof path === 'string') {
    return filesCache.getFileContents(path, textFileProcessor, path);
  }
  if (path.downloadUrl) {
    return filesCache.getFileContents(path.downloadUrl, textFileProcessor);
  }
  return null;
};

@inject('filesCache')
@inject((stores, props) => ({
  inputsRequest: getFileContents(props.inputsFile, stores.filesCache),
  mdFileRequest: getFileContents(props.mdFile, stores.filesCache),
  wdlFileRequest: getFileContents(props.wdlFile, stores.filesCache),
}))
@observer class WorkflowPreview extends React.Component {
  static propTypes = {
    inputsFile: FilePathProps,
    mdFile: FilePathProps,
    wdlFile: FilePathProps,
  };

  static defaultProps = {
    inputsFile: null,
    mdFile: null,
    wdlFile: null,
  };

  renderMDPreview = (previewFileRequest) => {
    if (previewFileRequest.pending && !previewFileRequest.loaded) {
      return <Loading />;
    }
    if (previewFileRequest.error) {
      return (
        <Alert type="error" message={previewFileRequest.error} />
      );
    }
    /* eslint-disable react/no-danger */
    return (
      <div
        id="description-text-container"
        className={styles.mdPreview}
        dangerouslySetInnerHTML={{__html: MarkdownRenderer.render(previewFileRequest.value)}}
      />
    );
    /* eslint-enable */
  };

  renderWDLPreview = (previewFileRequest) => {
    if (previewFileRequest.pending && !previewFileRequest.loaded) {
      return <Loading />;
    }
    if (previewFileRequest.error) {
      return (
        <Alert type="error" message={this.previewFileRequest.error} />
      );
    }
    const renderLine = (line, index) => <pre key={`line_${index}`}>{line}</pre>;
    return (
      <div
        id="description-text-container"
        className={styles.wdlPreview}
      >
        {
          (previewFileRequest.value || '')
            .split('\n')
            .map(renderLine)
        }
      </div>
    );
  };

  render() {
    const {mdFileRequest, wdlFileRequest} = this.props;
    if (mdFileRequest) {
      return this.renderMDPreview(mdFileRequest);
    }
    if (wdlFileRequest) {
      return this.renderWDLPreview(wdlFileRequest);
    }
    return (
      <div>
        Select wdl script to view it content.
      </div>
    );
  }
}

export default WorkflowPreview;
