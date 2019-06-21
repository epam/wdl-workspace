import React from 'react';
import {inject, observer} from 'mobx-react';
import {message, PageHeader} from 'antd';
import classNames from 'classnames';
import {launchWorkflow, processWorkflowSources} from './utilities';
import {
  SubmitWorkflow,
  Title,
  WDLInputs,
  WDLOptions,
  WDLScript,
} from './sections';

import '../../../static-styles/page-header-styles.css';
import styles from './styles.css';

@inject('workflowCache')
@inject((stores, {match}) => ({
  workflow: stores.workflowCache.getWorkflow(match.params?.id),
}))
@observer
class LaunchForm extends React.Component {
  state = {
    options: {
      launchOnHold: false,
    },
    pending: false,
    inputs: [],
    inputsValid: true,
    script: null,
    scriptValid: true,
    workflowLoaded: false,
  };

  /* Component lifecycle */

  componentDidMount() {
    const {workflow} = this.props;
    if (workflow?.loaded) {
      this.onReLaunchWorkflowLoaded();
    }
  }

  componentDidUpdate() {
    const {workflow} = this.props;
    const {state} = this;
    if (!state.workflowLoaded && workflow?.loaded) {
      this.onReLaunchWorkflowLoaded();
    }
  }

  /* Launch parameters modification */
  onChange = (
    {
      inputs,
      inputsValid,
      script,
      scriptValid,
      options,
    },
  ) => {
    const newState = {};
    if (inputs !== undefined) {
      newState.inputs = inputs;
    }
    if (script !== undefined) {
      newState.script = script;
    }
    if (options !== undefined) {
      newState.options = options;
    }
    if (inputsValid !== undefined) {
      newState.inputsValid = inputsValid;
    }
    if (scriptValid !== undefined) {
      newState.scriptValid = scriptValid;
    }
    this.setState(newState);
  };

  onReLaunchWorkflowLoaded = () => {
    const {workflow} = this.props;
    if (workflow) {
      processWorkflowSources({
        inputs: workflow.metadata.value.inputs || {},
        script: workflow.metadata.value.submittedFiles.workflow,
      }, false)
        .then((result) => {
          const {error, wdlInputs, wdlSource} = result;
          if (error) {
            message.error(error, 5);
          } else {
            const newState = {
              workflowLoaded: true,
            };
            if (wdlInputs) {
              newState.inputs = wdlInputs;
            }
            if (wdlSource) {
              newState.script = wdlSource;
            }
            this.setState(newState);
          }
        });
    }
  };

  /* Launch callback */
  launchWorkflowCallback = (options) => {
    const {error, id} = options;
    const {history} = this.props;
    if (error) {
      message.error(error, 5);
    } else if (id) {
      history.push(`/run/${id}/plain?launching=true`);
    } else {
      history.push('/runs');
    }
  };

  /* Render methods */
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
    const {workflow, history} = this.props;
    const {
      pending,
      inputs,
      inputsValid,
      options,
      script,
      scriptValid,
    } = this.state;
    return (
      <PageHeader
        className={classNames('launch-form-header', styles.launchFormContainer)}
        title={<Title workflow={workflow} />}
        onBack={() => history.goBack()}
      >
        <WDLScript
          disabled={pending || (workflow?.pending && !workflow?.loaded)}
          onChange={this.onChange}
          script={script}
          inputs={inputs}
        />
        <WDLInputs
          disabled={pending || (workflow?.pending && !workflow?.loaded)}
          onChange={this.onChange}
          inputs={inputs}
          previousSectionValid={scriptValid}
        />
        <WDLOptions
          disabled={pending || (workflow?.pending && !workflow?.loaded)}
          onChange={this.onChange}
          options={options}
          previousSectionValid={scriptValid && inputsValid}
        />
        <SubmitWorkflow
          disabled={!scriptValid || !inputsValid || pending || (workflow?.pending && !workflow?.loaded)}
          ready={scriptValid && inputsValid}
          onSubmit={
            () => this.disableComponentUntilDone(
              launchWorkflow,
              {
                callback: this.launchWorkflowCallback,
                message: 'Launching...',
              },
            )({inputs, options, script})
          }
        />
      </PageHeader>
    );
  }
}

export default LaunchForm;
