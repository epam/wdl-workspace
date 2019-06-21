import React from 'react';
import {Tag} from 'antd';

export default function ([labelId, label]) {
  return (
    <Tag key={`label_${labelId}`}>{label}</Tag>
  );
}
