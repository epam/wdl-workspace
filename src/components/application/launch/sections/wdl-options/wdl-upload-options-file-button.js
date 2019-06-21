import React from 'react';
import {Button, Icon, Upload} from 'antd';

export default function (
  {
    accept,
    disabled,
    file,
    onUpload,
    onRemove,
    style,
    title,
    visible,
  },
) {
  return (
    <div
      style={Object.assign(visible ? {} : {display: 'none'}, style)}
    >
      <Upload
        accept={accept}
        fileList={[file].filter(Boolean)}
        showUploadList
        multiple={false}
        disabled={disabled}
        onRemove={onRemove}
        beforeUpload={(f) => {
          onUpload(f);
          return false;
        }}
      >
        <Button>
          <Icon type="upload" />
          <span>{title}</span>
        </Button>
      </Upload>
    </div>
  );
}
