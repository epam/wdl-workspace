import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {Button, Modal, Row} from 'antd';

import WdlGraph from '../../../../../utilities/wdl-graph';

import '../../../../../../static-styles/launch-form-graph.css';


@observer
export default class LaunchGraph extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    wdlScript: PropTypes.string,
    onGraphReady: PropTypes.func,
    canEdit: PropTypes.bool,
  };

  static defaultProps = {
    wdlScript: '',
    onGraphReady: null,
    canEdit: false,
  };

  get imageSize() {
    if (this._graph) {
      return this._graph.imageSize;
    }
    return {
      width: 1,
      height: 1,
    };
  }

  onGraphReady = (graph) => {
    const {onGraphReady} = this.props;
    this._graph = graph;
    onGraphReady && onGraphReady(graph);
  };

  renderFooter = () => {
    const {onClose} = this.props;
    return (
      <Row
        type="flex"
        justify="end"
        align="middle"
      >
        <Button
          type="primary"
          onClick={onClose}
        >
          Close
        </Button>
      </Row>
    );
  };

  base64Image() {
    if (this._graph) {
      return this._graph.getImage ? this._graph.getImage() : '';
    }
    return '';
  }

  draw() {
    if (this._graph) {
      this._graph.draw();
    }
  }

  updateData() {
    if (this._graph) {
      this._graph.updateData();
    }
  }

  _graph;

  render() {
    const {onClose, visible, ...childProps} = this.props;
    return (
      <Modal
        centered
        className="launch-form-graph-modal"
        title="WDL Graph"
        width="90%"
        height="90%"
        footer={this.renderFooter()}
        visible={visible}
        onCancel={onClose}
      >
        <Row
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
          }}
        >
          <WdlGraph
            {...childProps}
            onGraphReady={this.onGraphReady}
          />
        </Row>
      </Modal>
    );
  }
}
