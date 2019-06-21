import React from 'react';
import {
  Button,
  Dropdown,
  Icon,
  Menu,
} from 'antd';
import {WdlInputTypes} from '../../utilities';

const AddInputsButtonOverlay = ({onAddWDLInput}) => (
  <Menu onClick={onAddWDLInput}>
    <Menu.Item key={WdlInputTypes.string}>String / number</Menu.Item>
    <Menu.Item key={WdlInputTypes.array}>Array</Menu.Item>
  </Menu>
);

export default function ({disabled, onAddWDLInputClicked}) {
  return [
    <Button.Group key="button">
      <Button
        onClick={() => onAddWDLInputClicked({})}
        disabled={disabled}
      >
        ADD
      </Button>
      <Dropdown overlay={<AddInputsButtonOverlay onAddWDLInput={onAddWDLInputClicked} />}>
        <Button disabled={disabled}>
          <Icon type="down" />
        </Button>
      </Dropdown>
    </Button.Group>,
    <b key="text" style={{marginLeft: 5}}>inputs manually</b>,
  ];
}
