import React from 'react';
import {
  Button,
  Icon,
  Input,
  Row,
} from 'antd';
import classNames from 'classnames';
import {WdlInputTypes} from '../../utilities';
import styles from '../../styles.css';

function renderArrayValueInput(
  {
    disabled,
    index,
    onEditWDLInput,
    onRemoveArrayRow,
    wdlInputs,
  },
) {
  const input = wdlInputs[index];
  const onEditWDLArrayInputValue = valueIndex => (e) => {
    input.value[valueIndex] = e.target.value;
    onEditWDLInput(index, 'value')({target: {value: input.value}});
  };
  const renderInput = (val, rowIndex) => (
    <Input
      key={`array_${index}_value_${rowIndex}`}
      value={val}
      style={{
        marginTop: rowIndex > 0 ? 4 : 0,
        marginBottom: input.value.length - 1 === rowIndex ? 4 : 0,
      }}
      suffix={
        (input.value).length > 1
        && (
          <Icon
            type="close-circle"
            theme="twoTone"
            twoToneColor="#f5222d"
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              onRemoveArrayRow(index, rowIndex);
            }}
          />
        )
      }
      onChange={onEditWDLArrayInputValue(rowIndex)}
      disabled={disabled}
    />
  );

  return (
    <div className={classNames(styles.input, {[styles.error]: !!input.valueError})}>
      {
        (input.value || []).map(renderInput)
      }
      {
        input.valueError
        && <span className={styles.errorMessage}>{input.valueError}</span>
      }
    </div>
  );
}

function renderStringValueInput(
  {
    disabled,
    index,
    onEditWDLInput,
    wdlInputs,
  },
) {
  const input = wdlInputs[index];
  return (
    <div className={classNames(styles.input, {[styles.error]: !!input.valueError})}>
      <Input
        value={input.value}
        onChange={onEditWDLInput(index, 'value')}
        disabled={disabled}
      />
      {
        input.valueError
        && <span className={styles.errorMessage}>{input.valueError}</span>
      }
    </div>
  );
}

export default (
  {
    disabled,
    index,
    onAddArrayRow,
    onEditWDLInput,
    onRemoveArrayRow,
    onRemoveWDLInput,
    wdlInputs,
  },
) => {
  const input = wdlInputs[index];

  const isArray = input.type === WdlInputTypes.array;
  return (
    <Row
      className={styles.wdlInputRow}
      type="flex"
      align="top"
    >
      <div className={classNames(styles.input, {[styles.error]: !!input.keyError})}>
        <Row type="flex">
          {
            isArray
            && (
              <Button
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  marginRight: -1,
                }}
                onClick={() => { onAddArrayRow(index); }}
                disabled={disabled}
              >
                <Icon type="plus-circle" />
                Add row
              </Button>
            )
          }
          <Input
            value={input.key}
            onChange={onEditWDLInput(index, 'key')}
            style={{
              ...{flex: 1, textAlign: 'right'},
              ...isArray
                ? {
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                } : {},
            }}
            disabled={disabled}
          />
        </Row>
        {input.keyError && <span className={input.keyError && styles.errorMessage}>{input.keyError}</span>}
      </div>
      <span style={{paddingRight: 3}}>:</span>
      {
        isArray
          ? renderArrayValueInput({
            disabled,
            index,
            onEditWDLInput,
            onRemoveArrayRow,
            wdlInputs,
          })
          : renderStringValueInput({
            disabled,
            index,
            onEditWDLInput,
            wdlInputs,
          })
      }
      <Button
        shape="circle"
        size="small"
        type="danger"
        onClick={onRemoveWDLInput(index)}
        disabled={disabled}
        style={
          isArray && (input.value || []).length > 1
            ? {
              alignSelf: 'center',
            }
            : {
              marginTop: 5,
            }
        }
      >
        <Icon type="close" />
      </Button>
    </Row>
  );
};
