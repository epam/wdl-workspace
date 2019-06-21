import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {message} from 'antd';
import {Or, Section} from '../common';
import {CodeEditor} from '../../../../utilities';
import ShowWDLGraphButton from './show-wdl-graph';
import UploadWDLButton from './upload-wdl-button';
import WDLScriptErrors from './wdl-script-errors';

import WorkflowLibrary from './workflow-library';
import styles from '../../styles.css';
import {fetchWorkflow, fetchWorkflowDescription, processWorkflowSources} from '../../utilities';

const DESCRIPTION_REQUEST_TIMEOUT = 1500;

export default class WDLScript extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    // eslint-disable-next-line
    inputs: PropTypes.array,
    script: PropTypes.string,
  };

  static defaultProps = {
    disabled: false,
    inputs: [],
    script: '',
  };

  state = {
    errors: [],
    pending: false,
    valid: true,
  };

  onChangeWdlSources = async ({inputs, script}, generateInputs = true) => {
    const {
      error,
      wdlInputs,
      wdlSource,
      wdlSourceErrors,
      wdlSourceValid,
    } = await processWorkflowSources({inputs, script}, generateInputs);
    if (error) {
      message.error(error, 5);
    } else {
      const {onChange} = this.props;
      const change = {};
      if (wdlSource || wdlInputs) {
        change.inputs = wdlInputs;
        if (wdlInputs && wdlInputs.length) {
          change.inputsValid = wdlInputs.filter(i => !i.valid).length === 0;
        }
        change.script = wdlSource;
      }
      const newState = {};
      if (wdlSourceValid !== undefined) {
        change.scriptValid = wdlSourceValid;
      }
      if (Object.keys(change).length > 0) {
        await onChange(change);
      }
      if (wdlSourceErrors) {
        newState.errors = wdlSourceErrors;
      }
      if (Object.keys(newState).length > 0) {
        this.setState(newState);
      }
    }
  };

  onChangeWdlText = async (e) => {
    await this.onChangeWdlSources({script: e}, false);
    if (this.descriptionRequestTimeout) {
      clearTimeout(this.descriptionRequestTimeout);
    }
    this.descriptionRequestTimeout = setTimeout(
      () => {
        const {script, inputs} = this.props;
        fetchWorkflowDescription(script, inputs)
          .then(this.validateWorkflowCallback);
      },
      DESCRIPTION_REQUEST_TIMEOUT,
    );
  };

  // WDL script & inputs validation callback
  validateWorkflowCallback = async (options) => {
    const {fetchError, workflow} = options;
    if (fetchError) {
      message.error(fetchError, 5);
    } else if (workflow) {
      const {
        errors,
        inputs,
        valid,
      } = workflow;
      const {
        onChange,
      } = this.props;
      await onChange({
        inputs,
        inputsValid: (inputs || []).filter(i => !i.valid).length === 0,
        scriptValid: valid,
      });
      this.setState({
        errors: errors || [],
        valid,
      });
    }
  };

  // 'Upload WDL Script' via URL callback
  fetchWorkflowScriptCallback = async (options) => {
    const {description, error, source} = options;
    if (error) {
      message.error(error, 5);
    } else {
      const {
        onChange,
      } = this.props;
      await onChange({script: source});
      if (description) {
        await this.validateWorkflowCallback(description);
      }
    }
  };

  disableComponentUntilDone = (fn, options) => (...eventArgs) => {
    const {args, callback, message: msg} = options;
    let hide;
    if (msg) {
      hide = message.loading(msg, 0);
    }
    this.setState({pending: true}, async () => {
      const result = await fn(...(eventArgs || []), ...(args || []));
      this.setState({pending: false}, () => {
        if (hide) {
          hide();
        }
        if (callback) {
          callback(result);
        }
      });
    });
  };

  render() {
    const {
      disabled,
      inputs,
      script,
    } = this.props;
    const {
      errors,
      pending,
      valid,
    } = this.state;
    return (
      <Section
        complete={valid}
        icon="code"
        title="WDL"
        description="Select, upload or edit WDL script"
      >
        <div
          key="actions"
          className={styles.actionsContainer}
        >
          <div className={styles.actions}>
            <WorkflowLibrary
              onSelect={(s, i) => this.onChangeWdlSources({inputs: i, script: s})}
              disabled={disabled || pending}
            />
            <Or />
            <UploadWDLButton
              disabled={disabled || pending}
              onFetch={this.disableComponentUntilDone(
                fetchWorkflow,
                {
                  args: [inputs],
                  callback: this.fetchWorkflowScriptCallback,
                  message: 'Fetching workflow...',
                },
              )}
              onUpload={file => this.onChangeWdlSources({script: file})}
            />
            <Or />
            <b>edit it manually</b>
            :
          </div>
          <ShowWDLGraphButton
            disabled={disabled || pending}
            wdl={script}
          />
        </div>
        <div
          key="code editor"
          className={styles.wdlEditorContainer}
        >
          <CodeEditor
            readOnly={disabled || pending}
            defaultCode={script || ''}
            language="wdl"
            onChange={this.onChangeWdlText}
            className={
              classNames(
                styles.wdlEditor,
                {
                  [styles.wdlEditorError]: !valid,
                },
              )}
          />
        </div>
        <WDLScriptErrors
          key="errors"
          errors={errors}
        />
      </Section>
    );
  }
}
