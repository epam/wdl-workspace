import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {computed, observable} from 'mobx';
import {Button, Icon} from 'antd';
import WorkflowListing from '../../../../../models/workflow-listing';
import WorkflowBrowser from './workflow-browser';

@observer
export default class WorkflowLibrary extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
  };

  static defaultProps = {
    disabled: false,
  };

  state = {
    browserVisible: false,
  };

  @observable workflowLibrary = new WorkflowListing();

  @computed
  get workflowLibraryEnabled() {
    return this.workflowLibrary.loaded
      && (this.workflowLibrary.value || []).length > 0;
  }

  openBrowser = () => {
    this.setState({
      browserVisible: true,
    });
  };

  closeBrowser = () => {
    this.setState({
      browserVisible: false,
    });
  };

  onSelect = async (...opts) => {
    const {onSelect} = this.props;
    await onSelect(...opts);
    this.setState({
      browserVisible: false,
    });
  };

  render() {
    const {
      disabled,
    } = this.props;
    const {
      browserVisible,
    } = this.state;
    if (!this.workflowLibraryEnabled) {
      return null;
    }
    return [
      <Button
        key="workflow library button"
        disabled={disabled}
        onClick={this.openBrowser}
      >
        <Icon type="folder-open" />
        Workflow library
      </Button>,
      <WorkflowBrowser
        disabled={disabled}
        key="workflow library"
        visible={browserVisible}
        onClose={this.closeBrowser}
        onSelectWorkflow={this.onSelect}
      />,
    ];
  }
}
