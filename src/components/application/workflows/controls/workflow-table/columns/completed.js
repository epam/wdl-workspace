import styles from '../workflow-table.css';
import {displayDate} from '../../../../../../utils';

export default function (endDateFilter) {
  return {
    title: 'Completed',
    dataIndex: 'end',
    key: 'end',
    className: styles.rowCompleted,
    render: date => displayDate(date),
    ...endDateFilter,
  };
}
