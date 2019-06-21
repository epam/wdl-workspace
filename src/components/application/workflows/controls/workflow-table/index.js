import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {
  Button,
  Checkbox,
  Empty,
  Row,
  Table,
} from 'antd';
import dateFns from 'date-fns';
import DayPicker from 'react-day-picker';
import classNames from 'classnames';

import {
  actionsColumn,
  completedColumn,
  elapsedColumn,
  nameColumn,
  startedColumn,
} from './columns';

import 'react-day-picker/lib/style.css';
import {WorkflowStatuses} from '../../../../utilities';

import styles from './workflow-table.css';
import {
  ACTION_ABORT_KEY,
  ACTION_DETAILS_KEY,
  ACTION_RELAUNCH_KEY,
  ACTION_RELEASE_ON_HOLD_KEY,
} from '../../../common/workflow-actions';

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';

@observer
class WorkflowTable extends Component {
  static propTypes = {
    dataSource: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
    ]).isRequired,
    handleTableChange: PropTypes.func,
    pagination: PropTypes.shape(),
    loading: PropTypes.bool,
    className: PropTypes.string,
    reloadTable: PropTypes.func,
    onSelect: PropTypes.func,
    onReLaunch: PropTypes.func,
    useFilter: PropTypes.bool,
    runDetailsUrl: PropTypes.func.isRequired,
  };

  static defaultProps = {
    handleTableChange: null,
    pagination: null,
    loading: false,
    className: null,
    reloadTable: undefined,
    onSelect: null,
    onReLaunch: null,
    useFilter: undefined,
  };

  state = {
    statuses: {
      visible: false,
      value: [],
      finalValue: [],
      filtered: false,
      isArray: true,
    },
    start: {
      visible: false,
      value: null,
      finalValue: null,
      filtered: false,
      isDate: true,
    },
    end: {
      visible: false,
      value: null,
      finalValue: null,
      filtered: false,
      isDate: true,
      isLastHour: true,
    },
  };

  onFilterDropdownVisibleChange = (filterParameterName, nullValue = null) => (visible) => {
    const {state} = this;
    const filterParameter = state[filterParameterName];
    state[filterParameterName] = undefined;
    filterParameter.visible = visible;
    if (!visible) {
      filterParameter.searchString = null;
      filterParameter.value = filterParameter.finalValue ? filterParameter.finalValue : nullValue;
      filterParameter.filtered = filterParameter.finalValue !== null
        && filterParameter.finalValue !== '';
    }
    const newState = Object.assign(state, {[filterParameterName]: filterParameter});
    this.setState(newState);
  };

  onFilterChanged = filterParameterName => () => {
    const {state} = this;
    const filterParameter = state[filterParameterName];
    state[filterParameterName] = undefined;
    filterParameter.visible = false;
    if (filterParameter.isArray) {
      filterParameter.finalValue = filterParameter.value.map(p => p);
    } else {
      filterParameter.finalValue = filterParameter.value;
    }
    filterParameter.filtered = filterParameter.finalValue !== null
      && filterParameter.finalValue !== '';
    const newState = Object.assign(state, {[filterParameterName]: filterParameter});
    if (this.table) {
      const nextFilters = this.table.state.filters;
      if (filterParameter.isDate) {
        nextFilters[filterParameterName] = filterParameter.filtered
          ? [this.getDateStr(filterParameter.finalValue)] : [];
      } else if (filterParameter.isArray) {
        nextFilters[filterParameterName] = filterParameter.filtered
          ? (filterParameter.finalValue || []).map(p => p) : [];
      } else {
        nextFilters[filterParameterName] = filterParameter.filtered
          ? [filterParameter.finalValue] : [];
      }
      this.table.handleFilter(filterParameterName, nextFilters);
    }
    this.setState(newState);
  };

  onFilterValueChange = filterParameterName => (value) => {
    const {state} = this;
    const filterParameter = state[filterParameterName];
    state[filterParameterName] = undefined;
    filterParameter.value = value;
    const newState = Object.assign(state, {[filterParameterName]: filterParameter});
    this.setState(newState);
  };

  getStatusesFilter = () => {
    const {state} = this;
    const parameter = 'statuses';
    const clear = () => {
      state[parameter].value = [];
      state[parameter].searchString = null;
      this.onFilterChanged(parameter)();
    };
    const onChange = status => (e) => {
      const {statuses} = this.state;
      const index = statuses.value.indexOf(status);
      if (e.target.checked && index === -1) {
        statuses.value.push(status);
      } else if (!e.target.checked && index >= 0) {
        statuses.value.splice(index, 1);
      }
      this.setState({statuses});
    };
    const filterDropdown = (
      <div className={styles.filterPopoverContainer} style={{width: 120}}>
        <Row>
          <div style={{maxHeight: 400, overflowY: 'auto'}}>
            {
              Object.values(WorkflowStatuses).map(status => (
                <Row style={{margin: 5}} key={status}>
                  <Checkbox onChange={onChange(status)} checked={state.statuses.value.indexOf(status) >= 0}>
                    {status}
                  </Checkbox>
                </Row>
              ))
            }
          </div>
        </Row>
        <Row type="flex" justify="space-between" className={styles.filterActionsButtonsContainer}>
          <Button type="link" style={{padding: 0}} onClick={this.onFilterChanged(parameter)}>OK</Button>
          <Button type="link" style={{padding: 0}} onClick={clear}>Clear</Button>
        </Row>
      </div>
    );
    return {
      filterDropdown,
      filterDropdownVisible: state[parameter].visible,
      filtered: state[parameter].filtered,
      onFilter: (val, item) => item.status === val,
      onFilterDropdownVisibleChange: this.onFilterDropdownVisibleChange(parameter, []),
      filteredValue: state[parameter].filtered
        ? state[parameter].finalValue : [],
    };
  };

  getDateStr = date => dateFns.format(new Date(date), DATE_FORMAT);

  getDateFilter = (parameter) => {
    const {state} = this;
    const clear = () => {
      state[parameter].value = null;
      this.onFilterChanged(parameter)();
    };

    const getNewDate = (date, isLastHour = false) => {
      if (isLastHour) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      }

      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0);
    };
    const onDateChanged = (date) => {
      const newDate = getNewDate(date, state[parameter].isLastHour);
      this.onFilterValueChange(parameter)(newDate);
    };

    const filterDropdown = (
      <div className={styles.filterPopoverContainer}>
        <DayPicker className={styles.datePicker} selectedDays={state[parameter].value} onDayClick={onDateChanged} />
        <Row type="flex" justify="space-between" className={styles.filterActionsButtonsContainer}>
          <Button type="link" style={{padding: 0}} onClick={this.onFilterChanged(parameter)}>OK</Button>
          <Button type="link" style={{padding: 0}} onClick={clear}>Clear</Button>
        </Row>
      </div>
    );
    return {
      filterDropdown,
      filterDropdownVisible: state[parameter].visible,
      filtered: state[parameter].filtered,
      onFilter: (val, item) => this.getDateStr(
        getNewDate(new Date(item[parameter]), state[parameter].isLastHour),
      ) === val,
      onFilterDropdownVisibleChange: this.onFilterDropdownVisibleChange(parameter),
      filteredValue: state[parameter].filtered
        ? [this.getDateStr(state[parameter].finalValue)] : [],
    };
  };

  actionCallback = (action, info) => {
    const {
      onSelect,
      onReLaunch,
      reloadTable,
    } = this.props;
    switch (action) {
      case ACTION_DETAILS_KEY:
        if (onSelect) {
          onSelect(info);
        }
        break;
      case ACTION_RELAUNCH_KEY:
        if (onReLaunch) {
          onReLaunch(info);
        }
        break;
      case ACTION_ABORT_KEY:
      case ACTION_RELEASE_ON_HOLD_KEY:
      default:
        if (reloadTable) {
          reloadTable();
        }
        break;
    }
  };

  getColumns = () => {
    const {useFilter} = this.props;
    const statusesFilter = useFilter ? this.getStatusesFilter() : {};
    const startDateFilter = useFilter ? this.getDateFilter('start') : {};
    const endDateFilter = useFilter ? this.getDateFilter('end') : {};

    return [
      nameColumn(statusesFilter),
      startedColumn(startDateFilter),
      completedColumn(endDateFilter),
      elapsedColumn(),
      actionsColumn(this.actionCallback),
    ];
  };

  render() {
    const {
      className,
      dataSource,
      handleTableChange,
      loading,
      onSelect,
      pagination,
    } = this.props;

    return (
      <Table
        className={classNames(styles.table, 'workflows-table', className)}
        ref={(el) => { this.table = el; }}
        columns={this.getColumns()}
        rowKey={item => item.id}
        dataSource={dataSource}
        onChange={handleTableChange}
        onRow={record => ({
          onClick: onSelect ? () => onSelect(record) : undefined,
        })}
        pagination={pagination}
        loading={loading}
        size="small"
        indentSize={10}
        locale={{emptyText: <Empty />, filterConfirm: 'OK', filterReset: 'Clear'}}
      />
    );
  }
}

export default WorkflowTable;
