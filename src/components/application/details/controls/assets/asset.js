import React from 'react';
import AssetValue from './asset-value';

export default function (
  {
    className,
    name,
    routes,
    value,
    workflow,
  },
) {
  return (
    <tr key={name} className={className}>
      <th>
        {name}
        :
      </th>
      <td>
        <AssetValue
          routes={routes}
          workflow={workflow}
          value={value}
        />
      </td>
    </tr>
  );
}
