import React from 'react';
import {Icon} from 'antd';
import styles from '../../styles.css';

export default (
  {
    complete,
    icon,
    title,
    description,
    children,
  },
) => (
  <div className={styles.section} data-complete={complete}>
    <div className={styles.header}>
      <div className={styles.icon}>
        <Icon type={icon} theme={complete && 'twoTone'} />
        <div className={styles.progressLine}>{'\u00A0'}</div>
      </div>
      <div className={styles.title}>
        <b>
          {title}
        </b>
        <span style={{fontSize: 'small'}}>
          {description}
        </span>
      </div>
    </div>
    <div className={styles.content}>
      {children}
    </div>
  </div>
);
