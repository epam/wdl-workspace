import React from 'react';
import styles from '../../styles.css';

export default function ({children}) {
  return <span className={styles.or}>{children || 'or'}</span>;
}
