import React from 'react';
import {Collapse} from 'antd';
import Asset from './asset';

export default function (
  {
    assets,
    assetClassName,
    className,
    header,
    routes,
    workflow,
  },
) {
  if (!assets || !workflow?.metadata?.loaded) {
    return null;
  }
  const assetsEntries = Object.entries(assets);
  if (assetsEntries.length === 0) {
    return null;
  }
  return (
    <Collapse.Panel key={header} header={header}>
      <table className={className}>
        <tbody>
          {
            assetsEntries.map((asset) => (
              <Asset
                key={asset[0]}
                className={assetClassName}
                name={asset[0]}
                value={asset[1]}
                routes={routes}
                workflow={workflow}
              />
            ))
          }
        </tbody>
      </table>
    </Collapse.Panel>
  );
}
