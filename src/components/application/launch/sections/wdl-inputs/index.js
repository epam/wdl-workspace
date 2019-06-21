import React from 'react';
import PropTypes from 'prop-types';
import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {message} from 'antd';
import styles from '../../styles.css';
import AddInputsButton from './add-inputs-button';
import UploadInputsButton from './upload-inputs-button';
import WDLInput from './wdl-input';
import {Or, Section} from '../common';
import {processWorkflowSources, validateInputs, WdlInputTypes} from '../../utilities';

@observer
export default class WDLInputs extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    // eslint-disable-next-line
    inputs: PropTypes.array,
    previousSectionValid: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    inputs: [],
    previousSectionValid: true,
  };

  @computed
  get valid() {
    const {inputs} = this.props;
    return (inputs || []).filter(i => !i.valid).length === 0;
  }

  wdlInputsChanged = (newWdlInputs) => {
    const {onChange} = this.props;
    validateInputs(newWdlInputs);
    onChange({inputs: newWdlInputs, inputsValid: newWdlInputs.filter(i => !i.valid).length === 0});
  };

  onAddWDLInputClicked = ({key}) => {
    const {inputs} = this.props;
    const wdlInputs = [...inputs];
    const value = key === WdlInputTypes.array ? [''] : '';
    wdlInputs.push({
      key: '',
      optional: false,
      value,
      type: key || WdlInputTypes.string,
    });
    this.wdlInputsChanged(wdlInputs);
  };

  addArrayRow = (index) => {
    const {disabled, inputs} = this.props;
    if (disabled) {
      return;
    }
    const wdlInputs = [...inputs];
    const input = wdlInputs[index];
    if (!input.value) {
      input.value = [];
    }
    if (Array.isArray(input.value)) {
      input.value.push('');
      this.wdlInputsChanged(wdlInputs);
    }
  };

  onEditWDLInput = (index, field) => (e) => {
    const {disabled, inputs} = this.props;
    if (disabled) {
      return;
    }
    const wdlInputs = [...inputs];
    wdlInputs[index][field] = e.target.value;
    this.wdlInputsChanged(wdlInputs);
  };

  removeArrayRow = (index, rowIndex) => {
    const {disabled, inputs} = this.props;
    if (disabled) {
      return;
    }
    const wdlInputs = [...inputs];
    const input = wdlInputs[index];
    if (!input.value || !input.value.length || input.value.length < 2) {
      return;
    }
    if (Array.isArray(input.value)) {
      input.value.splice(rowIndex, 1);
      this.wdlInputsChanged(wdlInputs);
    }
  };

  onRemoveWDLInputClicked = index => () => {
    const {disabled, inputs} = this.props;
    if (disabled) {
      return;
    }
    const wdlInputs = [...inputs];
    wdlInputs.splice(index, 1);
    this.wdlInputsChanged(wdlInputs);
  };

  onChangeWdlSources = async ({inputs}) => {
    const {
      error,
      wdlInputs,
    } = await processWorkflowSources({inputs});
    if (error) {
      message.error(error, 5);
    } else if (wdlInputs) {
      const {onChange} = this.props;
      onChange({inputs: [...wdlInputs], inputsValid: wdlInputs.filter(i => !i.valid).length === 0});
    }
  };

  render() {
    const {
      disabled,
      inputs,
      previousSectionValid,
    } = this.props;
    return (
      <Section
        complete={this.valid && previousSectionValid}
        icon="sliders"
        title="Inputs"
        description="Specify WDL inputs"
      >
        <div key="actions" className={styles.actions}>
          <UploadInputsButton
            disabled={disabled}
            onUpload={file => this.onChangeWdlSources({inputs: file})}
          />
          <Or />
          <AddInputsButton
            disabled={disabled}
            onAddWDLInputClicked={this.onAddWDLInputClicked}
          />
        </div>
        <div key="inputs" style={{marginTop: 5}}>
          {inputs.map((input, index) => (
            <WDLInput
              /* eslint-disable-next-line */
              key={`input_${index}`}
              index={index}
              disabled={disabled}
              onAddArrayRow={this.addArrayRow}
              onEditWDLInput={this.onEditWDLInput}
              onRemoveArrayRow={this.removeArrayRow}
              onRemoveWDLInput={this.onRemoveWDLInputClicked}
              wdlInputs={inputs}
            />
          ))}
        </div>
      </Section>
    );
  }
}
