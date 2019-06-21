import React from 'react';
import PropTypes from 'prop-types';
import {Button, Checkbox} from 'antd';
import WDLUploadOptionsFile from './wdl-upload-options-file-button';
import {WDLOptionKeys} from '../../utilities/launch-workflow';
import {Section} from '../common';

export default class WDLOptions extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.shape({
      launchOnHold: PropTypes.bool,
    }).isRequired,
    previousSectionValid: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    previousSectionValid: true,
  };

  state = {
    moreOptions: false,
  };

  moreOrLessOptionsClicked = () => {
    const {moreOptions} = this.state;
    this.setState({
      moreOptions: !moreOptions,
    });
  };

  launchOnHoldChanged = (e) => {
    const {
      onChange,
      options,
    } = this.props;
    options.launchOnHold = e.target.checked;
    onChange({options});
  };

  onUploadJSONFile = (property) => (file) => {
    const {
      onChange,
      options,
    } = this.props;
    options[property] = file;
    onChange({options});
  };

  onRemoveJSONFile = (property) => () => {
    const {
      onChange,
      options,
    } = this.props;
    delete options[property];
    onChange({options});
  };

  render() {
    const {
      disabled,
      options,
      previousSectionValid,
    } = this.props;
    const {
      moreOptions,
    } = this.state;
    return (
      <Section
        complete={previousSectionValid}
        icon="flag"
        title="Options"
        description="Specify launch options"
      >
        <Checkbox
          key="launch on hold"
          checked={options.launchOnHold}
          onChange={this.launchOnHoldChanged}
          disabled={disabled}
        >
          Launch
          <b style={{marginLeft: 4}}>on hold</b>
        </Checkbox>
        <WDLUploadOptionsFile
          accept=".zip"
          file={options[WDLOptionKeys.dependencies]}
          key={WDLOptionKeys.dependencies}
          disabled={disabled}
          onUpload={this.onUploadJSONFile(WDLOptionKeys.dependencies)}
          onRemove={this.onRemoveJSONFile(WDLOptionKeys.dependencies)}
          style={{marginTop: 5}}
          title="Upload workflow dependencies (.zip)"
          visible={moreOptions}
        />
        <WDLUploadOptionsFile
          accept=".json"
          file={options[WDLOptionKeys.labels]}
          key={WDLOptionKeys.labels}
          disabled={disabled}
          onUpload={this.onUploadJSONFile(WDLOptionKeys.labels)}
          onRemove={this.onRemoveJSONFile(WDLOptionKeys.labels)}
          style={{marginTop: 5}}
          title="Upload workflow labels (.json)"
          visible={moreOptions}
        />
        <WDLUploadOptionsFile
          accept=".json"
          file={options[WDLOptionKeys.options]}
          key={WDLOptionKeys.options}
          disabled={disabled}
          onUpload={this.onUploadJSONFile(WDLOptionKeys.options)}
          onRemove={this.onRemoveJSONFile(WDLOptionKeys.options)}
          style={{marginTop: 5}}
          title="Upload configuration options (.json)"
          visible={moreOptions}
        />
        <div key="more options">
          <Button
            onClick={this.moreOrLessOptionsClicked}
            style={{marginTop: 5}}
          >
            <span>{moreOptions ? 'Less ' : 'More '} options...</span>
          </Button>
        </div>
      </Section>
    );
  }
}
