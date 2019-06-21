import React from 'react';
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';

import codeEditorStyles from './CodeEditor.css';
// eslint-disable-next-line
import 'codemirror/addon/mode/simple.js';

CodeMirror.defineSimpleMode('wdl', {
  start: [
    {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: 'string'},
    {regex: /'(?:[^\\]|\\.)*?(?:'|$)/, token: 'string'},
    {
      regex: /(workflow|task)(\s+)([A-Za-z$][\w$]*)/,
      token: ['keyword', null, 'variable-2'],
    },
    {
      regex: /(call)(\s+)([A-Za-z$][\w$]*)(\s+)(as)(\s+)([A-Za-z$][\w$]*)/,
      token: ['keyword', null, 'variable-1', null, 'keyword', null, 'variable-2'],
    },
    {
      regex: /(call)(\s+)([A-Za-z$][\w$]*)/,
      token: ['keyword', null, 'variable-2'],
    },
    {
      regex: /(?:task|call|workflow|if|scatter|while|input|output|as)\b/,
      token: 'keyword',
    },
    {
      regex: /(command)(\s+)({)/,
      token: ['keyword', null, null],
      push: 'command_usual',
    },
    {
      regex: /(command)(\s+)(<<<)/,
      token: ['keyword', null, null],
      mode: {spec: 'text/x-sh', end: /(?:>>>)/},
    },
    {regex: /(?:Boolean|Int|Float|File|String)/, token: 'atom'},
    {
      regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
      token: 'number',
    },
    {regex: /\/\/.*/, token: 'comment'},
    {regex: /#.*/, token: 'comment'},
    {regex: /\/(?:[^\\]|\\.)*?\//, token: 'variable-3'},
    {regex: /\/\*/, token: 'comment', next: 'comment'},
    {regex: /[-+/*=<>!]+/, token: 'operator'},
    {regex: /[{[(:]/, indent: true},
    {regex: /[})\]]]/, dedent: true},
    {regex: /[A-Za-z$][\w$]*/, token: 'variable'},
  ],

  command_usual: [
    {regex: /\/\/.*/, token: 'comment'},
    {regex: /#.*/, token: 'comment'},
    {regex: /(?:{)/, token: null, push: 'command_usual'},
    {regex: /(?:})/, token: null, pop: true},
  ],

  comment: [
    {regex: /.*?\*\//, token: 'comment', next: 'start'},
    {regex: /.*/, token: 'comment'},
  ],

  meta: {
    dontIndentStates: ['comment'],
    lineComment: '#',
  },
});

@observer
class CodeEditor extends React.Component {
  static propTypes = {
    language: PropTypes.string,
    fileExtension: PropTypes.string,
    fileName: PropTypes.string,
    code: PropTypes.string,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func,
    className: PropTypes.string,
    defaultCode: PropTypes.string,
    lineWrapping: PropTypes.bool,
    supportsFullScreen: PropTypes.bool,
    lineNumbers: PropTypes.bool,
    placeholder: PropTypes.string,
    // eslint-disable-next-line
    style: PropTypes.object,
  };

  static defaultProps = {
    className: null,
    code: null,
    defaultCode: null,
    fileExtension: null,
    fileName: null,
    language: 'wdl',
    lineNumbers: true,
    lineWrapping: false,
    onChange: null,
    placeholder: null,
    readOnly: false,
    style: null,
    supportsFullScreen: false,
  };

  componentDidMount() {
    this._initializeCodeMirror();
  }

  // eslint-disable-next-line
  componentWillReceiveProps(nextProps, nextContent) {
    const {defaultCode} = this.props;
    if (nextProps.defaultCode !== defaultCode && !nextProps.code) {
      this._updateEditor(nextProps.defaultCode);
    } else {
      this._updateEditor();
    }
  }

  // eslint-disable-next-line
  componentDidUpdate(props, prevState, snapshot) {
    const {code, defaultCode} = this.props;
    if (props.defaultCode !== defaultCode && !code) {
      this._updateEditor(defaultCode);
    } else {
      this._updateEditor();
    }
  }

  _onCodeChange = async (editor) => {
    const {line, ch} = editor.getCursor();
    const {onChange} = this.props;
    if (onChange) {
      await onChange(editor.getValue());
    }
    editor.setCursor(line, ch);
  };

  _getFileLanguage = () => {
    const {language} = this.props;
    if (language) {
      return language;
    }
    let {fileExtension} = this.props;
    if (!fileExtension) {
      const {fileName} = this.props;
      if (fileName) {
        const parts = fileName.split('.');
        fileExtension = parts[parts.length - 1];
      }
    }
    if (!fileExtension) {
      return 'python';
    }
    switch (fileExtension.toLowerCase()) {
      case 'sh': return 'shell';
      case 'xml': return 'xml';
      case 'json':
      case 'js':
        return 'javascript';
      case 'r': return 'r';
      case 'wdl': return 'wdl';
      case 'txt': return 'text';
      default: return 'python';
    }
  };

  _initializeCodeMirrorDelayed = (textarea) => {
    this.textArea = textarea;
  };

  _initializeCodeMirror = () => {
    if (!this.textArea) {
      this.codeMirrorInstance = null;
      return;
    }
    const keys = {
      ctrlSpace: 'Ctrl-space',
      esc: 'Esc',
      f11: 'F11',
      tab: 'Tab',
    };
    const defaultExtraKeys = {
      [keys.ctrlSpace]: 'autocomplete',
      [keys.tab]: (cm) => {
        const spaces = new Array(cm.getOption('indentUnit') + 1).join(' ');
        cm.replaceSelection(spaces);
      },
    };
    const {
      defaultCode,
      lineNumbers,
      lineWrapping,
      readOnly,
      placeholder,
      supportsFullScreen,
    } = this.props;
    const extraKeys = supportsFullScreen ? {
      [keys.f11]: (cm) => {
        cm.setOption('fullScreen', !cm.getOption('fullScreen'));
      },
      [keys.esc]: (cm) => {
        if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
      },
      ...defaultExtraKeys,
    } : defaultExtraKeys;
    CodeMirror.commands.autocomplete = (cm) => {
      cm.showHint({hint: CodeMirror.hint.anyword});
      cm.showHint({hint: CodeMirror.hint.javascript});
    };
    this.codeMirrorInstance = CodeMirror.fromTextArea(this.textArea, {
      mode: this._getFileLanguage(),
      autoCloseBrackets: true,
      autoCloseTags: true,
      showHint: true,
      readOnly,
      search: true,
      indentUnit: 4,
      tabSize: 4,
      lineWrapping,
      spellcheck: true,
      lineNumbers,
      extraKeys,
      placeholder,
    });
    this.codeMirrorInstance.setValue(defaultCode || '');
    this._updateEditor();
  };

  _updateEditor = (newCode) => {
    if (!this.codeMirrorInstance) {
      return;
    }
    const {
      code,
      readOnly,
    } = this.props;
    this.codeMirrorInstance.setSize('100%', '100%');
    this.codeMirrorInstance.display.wrapper.style.backgroundColor = readOnly
      ? '#f0f0f0' : 'white';
    this.codeMirrorInstance.setOption('mode', this._getFileLanguage());
    this.codeMirrorInstance.setOption('readOnly', readOnly);
    this.codeMirrorInstance.off('change', this._onCodeChange);
    if (newCode) {
      this.codeMirrorInstance.setValue(newCode);
    } else if (code) {
      this.codeMirrorInstance.setValue(code);
    }
    this.codeMirrorInstance.on('change', this._onCodeChange);
  };

  codeMirrorInstance;

  textArea;

  render() {
    const {
      className,
      readOnly,
      style,
    } = this.props;
    return (
      <div
        className={className || codeEditorStyles.container}
        style={style}
      >
        <div
          className={
            readOnly
              ? codeEditorStyles.readOnlyEditor
              : codeEditorStyles.editor
          }
        >
          <input
            type="textarea"
            style={{width: '100%', height: '100%'}}
            ref={this._initializeCodeMirrorDelayed}
          />
        </div>
      </div>
    );
  }
}

export default CodeEditor;
