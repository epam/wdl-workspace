import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {
  Button,
  Icon,
} from 'antd';
import LaunchGraph from './wdl-graph';

@observer
export default class ShowWDLGraphButton extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    wdl: PropTypes.string,
  };

  static defaultProps = {
    disabled: false,
    wdl: '',
  };

  state = {
    visible: false,
  };

  onShowGraph = () => {
    this.setState({visible: true});
  };

  onHideGraph = () => {
    this.setState({visible: false});
  };

  render() {
    const {
      disabled,
      wdl,
    } = this.props;
    const {
      visible,
    } = this.state;
    return [
      <Button
        key="show wdl graph"
        disabled={disabled || !wdl}
        onClick={this.onShowGraph}
      >
        <Icon type="apartment" />
        Show WDL graph
      </Button>,
      <LaunchGraph
        key="graph"
        visible={visible}
        wdlScript={wdl}
        onClose={this.onHideGraph}
      />,
    ];
  }
}
