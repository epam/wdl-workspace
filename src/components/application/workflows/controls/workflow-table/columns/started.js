import styles from '../workflow-table.css';
import {displayDate} from '../../../../../../utils';

export default function (startDateFilter) {
  return {
    title: 'Started',
    dataIndex: 'start',
    key: 'start',
    className: styles.rowStarted,
    render: date => displayDate(date),
    ...startDateFilter,
  };
}
