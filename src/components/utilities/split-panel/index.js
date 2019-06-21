import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {computed} from 'mobx';
import {Row, Icon} from 'antd';

const MINIMUM_CONTENT_SIZE = 50;
const MAX_SIZE_ITERATIONS = 10;

const filterRealChild = (child) => !!child;

@observer
class SplitPanel extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    onPanelClose: PropTypes.func,
    onPanelResize: PropTypes.func,
    onPanelResizeDelay: PropTypes.number,
    resizerSize: PropTypes.number,
    contentPadding: PropTypes.number,
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
    // eslint-disable-next-line
    style: PropTypes.object,
    contentInfo: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        title: PropTypes.string,
        closable: PropTypes.bool,
        containerStyle: PropTypes.object,
        containerClassName: PropTypes.string,
        size: PropTypes.shape({
          keepPreviousSize: PropTypes.bool,
          priority: PropTypes.number,
          pxMinimum: PropTypes.number,
          percentMinimum: PropTypes.number,
          pxMaximum: PropTypes.number,
          percentMaximum: PropTypes.number,
          pxDefault: PropTypes.number,
          percentDefault: PropTypes.number,
        }),
      }),
    ),
  };

  static defaultProps = {
    className: undefined,
    onPanelClose: undefined,
    onPanelResize: undefined,
    onPanelResizeDelay: 250,
    resizerSize: 6,
    contentPadding: 0,
    orientation: 'horizontal',
    style: undefined,
    contentInfo: undefined,
  };

  state = {
    sizes: {},
    container: undefined,
    activeResizer: null,
    activeResizerInfo: null,
  };

  componentDidMount() {
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillReceiveProps(nextProps) {
    const {children} = this.props;
    const nextPropsChildrenLength = (nextProps.children || []).filter(filterRealChild).length;
    const currentPropsChildrenLength = (children || []).filter(filterRealChild).length;
    if (nextPropsChildrenLength !== currentPropsChildrenLength) {
      this.resetWidthsState((nextProps.children || []).filter(filterRealChild), nextProps.contentInfo);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  @computed
  get isVertical() {
    const {orientation} = this.props;
    return orientation === 'vertical';
  }

  @computed
  get totalSize() {
    const {container} = this.state;
    if (container) {
      return this.isVertical
        ? container.offsetHeight || container.clientHeight
        : container.offsetWidth || container.clientWidth;
    }
    return null;
  }

  getChildKey = (childIndex, childArray) => {
    const {children} = this.props;
    childArray = childArray || (children || []).filter(filterRealChild);
    const child = childArray[childIndex];
    return child.key || `child_${childIndex}`;
  };

  getContentInfo = (key, contentInfoValue) => {
    const {contentInfo} = this.props;
    contentInfoValue = contentInfoValue || contentInfo;
    if (contentInfoValue) {
      const [info] = contentInfoValue.filter((i) => i.key === key);
      if (info) {
        return info;
      }
    }
    return {key};
  };

  getResizerIdentifier = (resizerIndex) => `resizer_${resizerIndex};`;

  renderResizer = (resizerIndex) => {
    const onMouseDown = (e) => {
      const {container} = this.state;
      if (container) {
        const coordinate = this.isVertical
          ? e.nativeEvent.pageY - container.offsetTop
          : e.nativeEvent.pageX - container.offsetLeft;
        this.setState({
          activeResizer: resizerIndex,
          activeResizerInfo: {
            coordinate,
          },
        });
      }
    };
    const {resizerSize} = this.props;
    const style = {
      cursor: this.isVertical ? 'row-resize' : 'col-resize',
      padding: this.isVertical ? '2px 0px' : '0px 2px',
      width: this.isVertical ? undefined : resizerSize,
      height: this.isVertical ? resizerSize : undefined,
    };
    return (
      // eslint-disable-next-line
      <div
        id={this.getResizerIdentifier(resizerIndex)}
        onMouseDown={onMouseDown}
        key={this.getResizerIdentifier(resizerIndex)}
        style={style}
      >
        <div
          style={{
            backgroundColor: '#eee',
            height: '100%',
            width: '100%',
          }}
        >
          {'\u00A0'}
        </div>
      </div>
    );
  };

  getChildMinimumSizePx = (childIndex) => {
    const info = this.getContentInfo(this.getChildKey(childIndex));
    if (info && info.size) {
      if (info.size.pxMinimum) {
        return info.size.pxMinimum;
      }
      if (info.size.percentMinimum) {
        return this.toPXSize(info.size.percentMinimum / 100.0);
      }
    }
    return MINIMUM_CONTENT_SIZE;
  };

  getChildMaximumSizePx = (childIndex) => {
    const info = this.getContentInfo(this.getChildKey(childIndex));
    if (info && info.size) {
      if (info.size.pxMaximum) {
        return info.size.pxMaximum;
      }
      if (info.size.percentMaximum) {
        return this.toPXSize(info.size.percentMaximum / 100.0);
      }
    }
    return this.totalSize;
  };

  getChildSize = (childIndex) => {
    const {children, resizerSize} = this.props;
    const childrenCount = (children || []).filter(filterRealChild).length;
    const key = this.getChildKey(childIndex);
    const {sizes} = this.state;
    let size;
    if (sizes && sizes[key]) {
      size = sizes[key];
    } else {
      size = this.toPercentSize((this.totalSize - (childrenCount - 1) * resizerSize) / childrenCount);
    }
    return size;
  };

  setChildSize = (childIndex, size, sizesObj, push = false) => {
    const key = this.getChildKey(childIndex);
    const {sizes} = this.state;
    sizesObj = sizesObj || sizes;
    if (!sizesObj) {
      sizesObj = {};
    }
    sizesObj[key] = size;
    if (push) {
      this.setState({
        sizes: sizesObj,
      });
    }
    return sizesObj;
  };

  renderChild = (childIndex) => {
    const {contentPadding, children} = this.props;
    const content = (children || []).filter(filterRealChild)[childIndex];
    const key = this.getChildKey(childIndex);
    const size = this.getChildSize(childIndex);
    let style = {
      overflow: 'auto',
      position: 'relative',
      padding: contentPadding,
    };
    if (this.isVertical) {
      style.height = `${size * 100}%`;
    } else {
      style.width = `${size * 100}%`;
    }
    const info = this.getContentInfo(key);
    if (info && info.containerStyle !== undefined) {
      style = Object.assign(style, info.containerStyle);
    }
    let header;
    if (info && (info.title || info.closable)) {
      let closable;
      if (info.closable) {
        const {onPanelClose} = this.props;
        closable = (
          <Icon
            type="close"
            onClick={() => onPanelClose && info && onPanelClose(info.key)}
            style={{cursor: 'pointer'}}
          />
        );
      }
      header = (
        <Row
          type="flex"
          justify="space-between"
          align="middle"
          style={{
            backgroundColor: '#efefef',
            borderBottom: '1px solid #ddd',
            borderTop: '1px solid #ddd',
            padding: '0px 5px',
          }}
        >
          <span>{info.title || ''}</span>
          {closable}
        </Row>
      );
    }
    return (
      <div className={info ? info.containerClassName : undefined} key={`child_${childIndex}`} style={style}>
        {header}
        {content}
      </div>
    );
  };

  renderSplitPaneContent = () => {
    const result = [];
    const {children} = this.props;
    const {length} = (children || []).filter(filterRealChild);
    for (let i = 0; i < length; i++) {
      result.push(this.renderChild(i));
      if (i < length - 1) {
        result.push(this.renderResizer(i));
      }
    }
    return result;
  };

  initializeSplitPane = (div) => {
    this.setState(
      {
        container: div,
      },
      () => {
        const {container} = this.state;
        const {children, contentInfo} = this.props;
        if (container) {
          this.resetWidthsState((children || []).filter(filterRealChild), contentInfo);
        }
      },
    );
  };

  toPercentSize = (px) => {
    if (!px) {
      return 0;
    }
    return px / this.totalSize;
  };

  // percent [0..1]
  toPXSize = (percent) => {
    if (!percent) {
      return 0;
    }
    return this.totalSize * percent;
  };

  resetWidthsState = (children, infos) => {
    const sizesObj = {};
    const getChildSizePriority = (key) => {
      const info = this.getContentInfo(key, infos);
      if (info && info.size && info.size.priority) {
        return info.size.priority;
      }
      return 0;
    };
    const sortedChildren = children.filter(filterRealChild).sort((childA, childB) => {
      const priorityA = getChildSizePriority(childA.key);
      const priorityB = getChildSizePriority(childB.key);
      if (priorityA > priorityB) {
        return -1;
      }
      if (priorityA < priorityB) {
        return 1;
      }
      return 0;
    });
    const maxSizes = {};
    const minSizes = {};
    const getChildKey = (i, array) => {
      const index = (children || []).filter(filterRealChild).indexOf(array[i]);
      return this.getChildKey(index, (children || []).filter(filterRealChild));
    };
    for (let i = 0; i < sortedChildren.length; i++) {
      const key = getChildKey(i, sortedChildren);
      const info = this.getContentInfo(key, infos);
      if (info && info.size && info.size.keepPreviousSize) {
        const {sizes} = this.state;
        let width = sizes[key];
        if (width !== undefined) {
          sizesObj[key] = sizes[key];
          const min =
            this.toPercentSize(info.size.pxMinimum) || (info.size.percentMinimum ? info.size.percentMinimum / 100 : 0);
          const max =
            this.toPercentSize(info.size.pxMaximum) || (info.size.percentMaximum ? info.size.percentMaximum / 100 : 1);
          width = Math.max(min, Math.min(max, width));
          maxSizes[key] = width === max;
          minSizes[key] = width === min;
        }
      }
    }
    const setSizes = (size, iteration) => {
      if (iteration === MAX_SIZE_ITERATIONS || size === 0) {
        return;
      }
      let totalWidth = size;
      const notProcessedChildren =
        size > 0 ? sortedChildren.filter(({key}) => !maxSizes[key]) : sortedChildren.filter(({key}) => !minSizes[key]);
      for (let i = 0; i < notProcessedChildren.length; i++) {
        const key = getChildKey(i, notProcessedChildren);
        const info = this.getContentInfo(key, infos);
        let width = sizesObj[key];
        if (!width) {
          if (info && info.size && info.size.pxDefault) {
            width = this.toPercentSize(info.size.pxDefault);
          } else if (info && info.size && info.size.percentDefault) {
            width = info.size.percentDefault / 100;
          } else {
            width = totalWidth / (notProcessedChildren.length - i);
          }
          if (i === notProcessedChildren.length - 1) {
            width = totalWidth;
          }
        } else if (iteration > 0) {
          width += totalWidth / (notProcessedChildren.length - i);
        }
        if (info && info.size) {
          const min =
            this.toPercentSize(info.size.pxMinimum) || (info.size.percentMinimum ? info.size.percentMinimum / 100 : 0);
          const max =
            this.toPercentSize(info.size.pxMaximum) || (info.size.percentMaximum ? info.size.percentMaximum / 100 : 1);
          width = Math.max(min, Math.min(max, width));
          maxSizes[key] = width === max;
          minSizes[key] = width === min;
        }
        let addedWidth = width;
        if (iteration > 0 && sizesObj[key]) {
          const delta = width - sizesObj[key];
          sizesObj[key] = width;
          addedWidth = delta;
        } else {
          sizesObj[key] = width;
        }
        totalWidth -= addedWidth;
      }
      setSizes(totalWidth, iteration + 1);
    };
    setSizes(1, 0);
    this.setState({
      activeResizer: null,
      activeResizerInfo: null,
      sizes: sizesObj,
    });
  };

  reportPanelResize = () => {
    const {onPanelResize, onPanelResizeDelay} = this.props;
    if (!onPanelResize) {
      return;
    }
    if (this.panelResizeTimeout) {
      clearTimeout(this.panelResizeTimeout);
    }
    this.panelResizeTimeout = setTimeout(() => {
      if (onPanelResize) {
        onPanelResize(this);
      }
      this.panelResizeTimeout = undefined;
    }, onPanelResizeDelay);
  };

  updateState = (e) => {
    const {activeResizer, activeResizerInfo, container} = this.state;
    if (activeResizer !== null && activeResizerInfo) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.cancelBubble = true;
      e.returnValue = false;
      const coordinate = this.isVertical ? e.pageY - container.offsetTop : e.pageX - container.offsetLeft;
      const delta = coordinate - activeResizerInfo.coordinate;
      const leftChildSizePx = this.toPXSize(this.getChildSize(activeResizer)) + delta;
      const rightChildSizePx = this.toPXSize(this.getChildSize(activeResizer + 1)) - delta;
      const leftChildMinimumSizePx = this.getChildMinimumSizePx(activeResizer);
      const leftChildMaximumSizePx = this.getChildMaximumSizePx(activeResizer);
      const rightChildMinimumSizePx = this.getChildMinimumSizePx(activeResizer + 1);
      const rightChildMaximumSizePx = this.getChildMaximumSizePx(activeResizer + 1);
      if (
        leftChildSizePx >= leftChildMinimumSizePx &&
        leftChildSizePx <= leftChildMaximumSizePx &&
        rightChildSizePx >= rightChildMinimumSizePx &&
        rightChildSizePx <= rightChildMaximumSizePx
      ) {
        const leftChildWidth = this.toPercentSize(leftChildSizePx);
        const rightChildWidth = this.toPercentSize(rightChildSizePx);
        const info = this.setChildSize(activeResizer, leftChildWidth);
        this.setChildSize(activeResizer + 1, rightChildWidth, info);
        this.setState(
          {
            sizes: info,
            activeResizerInfo: {
              coordinate,
            },
          },
          this.reportPanelResize,
        );
      }
      return false;
    }
    return true;
  };

  onMouseMove = (e) => this.updateState(e);

  onMouseUp = (e) => {
    this.updateState(e);
    const {activeResizer, activeResizerInfo} = this.state;
    if (activeResizer !== null && activeResizerInfo) {
      this.setState({
        activeResizer: null,
        activeResizerInfo: null,
      });
    }
  };

  panelResizeTimeout;

  render() {
    const {className, style} = this.props;
    return (
      <div
        className={`split-panel ${className}`}
        ref={this.initializeSplitPane}
        style={Object.assign(
          {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: this.isVertical ? 'column' : 'row',
          },
          style || {},
        )}
      >
        {this.totalSize ? this.renderSplitPaneContent() : undefined}
      </div>
    );
  }
}

export default SplitPanel;
