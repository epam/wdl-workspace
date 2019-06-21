import React from 'react';
import styles from '../../details.css';

export default function ({children, name, value}) {
  if (!name || (!value && !(children || []).length)) {
    return null;
  }
  return (
    <tr key={name} className={styles.mainInfoRow}>
      <th>
        {name}:
      </th>
      <td>{value || children}</td>
    </tr>
  );
}
