import React from 'react';
import {
  Button,
  Icon,
  Input,
  Row,
} from 'antd';

export default (
  {
    className,
    inputClassName,
    onChange,
    onFetch,
    pending,
    url,
  },
) => (
  <Row type="flex" className={className}>
    <Input
      disabled={pending}
      prefix={<Icon type="link" />}
      className={inputClassName}
      style={{flex: 1}}
      value={url || ''}
      onChange={onChange}
      onPressEnter={() => onFetch(url)}
      placeholder="Enter URL"
    />
    <Button
      type="primary"
      disabled={pending}
      style={{
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      }}
      onClick={() => onFetch(url)}
    >
      Load
    </Button>
  </Row>
);
