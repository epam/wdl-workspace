import React from 'react';
import {
  Button,
  Col,
  Input,
  Row,
} from 'antd';
import styles from '../../../details.css';

export default function (
  {
    next,
    onClose,
    onSearch,
    prev,
    searchText,
    searchResults,
    searchResultIndex,
    visible,
  },
) {
  if (!visible) {
    return null;
  }
  return (
    <Row
      align="middle"
      className={styles.searchContainer}
      type="flex"
    >
      <Col span={12} style={{paddingLeft: 10}}>
        <Input
          defaultValue={searchText}
          autoFocus
          placeholder="Search"
          onPressEnter={onSearch}
          style={{width: '100%'}}
        />
      </Col>
      <Col span={8} className={styles.searchButtonsContainer}>
        <Button
          size="small"
          onClick={prev}
          disabled={
            !searchText
            || searchResults.length === 0
            || searchResultIndex === 0
          }
        >
          Prev
        </Button>
        <Button
          size="small"
          onClick={next}
          disabled={
            !searchText
            || searchResults.length === 0
            || searchResultIndex === searchResults.length - 1
          }
        >
          Next
        </Button>
      </Col>
      <Col span={4} style={{textAlign: 'right', paddingRight: 10}}>
        <Button size="small" onClick={onClose}>
          Done
        </Button>
      </Col>
    </Row>
  );
}
