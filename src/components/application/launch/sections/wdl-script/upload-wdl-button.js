import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {
  Button,
  Icon,
  Popover,
  Upload,
} from 'antd';
import {generateUploadOptions} from '../../utilities';
import FetchWorkflowPopup from './fetch-workflow-popup';
import styles from '../../styles.css';

@observer
export default class UploadWDLButton extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onFetch: PropTypes.func.isRequired,
    onUpload: PropTypes.func.isRequired,
  };

  static defaultProps = {
    disabled: false,
  };

  state = {
    popoverVisible: false,
    url: null,
  };

  onWorkflowUrlChanged = (e) => {
    this.setState({url: e.target.value});
  };

  onPopoverVisibilityChanged = (visible) => {
    this.setState({popoverVisible: visible});
  };

  render() {
    const {
      disabled,
      onFetch,
      onUpload,
    } = this.props;
    const {
      popoverVisible,
      url,
    } = this.state;
    return (
      <Button.Group>
        <Upload {...generateUploadOptions(onUpload)}>
          <Button
            disabled={disabled}
            style={{
              borderTopLeftRadius: 4,
              borderBottomLeftRadius: 4,
            }}
          >
            <Icon type="upload" />
            Upload WDL script
          </Button>
        </Upload>
        <Popover
          trigger="click"
          title="Load WDL script from URL"
          content={(
            <FetchWorkflowPopup
              className={styles.loadFromUrlPopover}
              inputClassName={styles.loadFromUrlInput}
              onChange={this.onWorkflowUrlChanged}
              onFetch={onFetch}
              pending={disabled}
              url={url}
            />
          )}
          visible={popoverVisible}
          onVisibleChange={this.onPopoverVisibilityChanged}
        >
          <Button disabled={disabled}>
            <Icon type="down" />
          </Button>
        </Popover>
      </Button.Group>
    );
  }
}
