import React from 'react';
import {
  Button,
  Icon,
  Upload,
} from 'antd';
import {generateUploadOptions} from '../../utilities';

export default function ({disabled, onUpload}) {
  return (
    <Upload {...generateUploadOptions(onUpload)}>
      <Button
        disabled={disabled}
        style={{
          borderTopLeftRadius: 4,
          borderBottomLeftRadius: 4,
        }}
      >
        <Icon type="upload" />
        Upload
        <b style={{marginLeft: 3, marginRight: 3}}>inputs.json</b>
        file
      </Button>
    </Upload>
  );
}
