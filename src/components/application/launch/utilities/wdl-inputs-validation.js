import WdlInputTypes from './wdl-input-types';

function validateInputValue(wdlInput) {
  if (wdlInput.optional) {
    return;
  }
  if (wdlInput.type === WdlInputTypes.array) {
    for (let i = 0; i < (wdlInput.value || []).length; i++) {
      if (!wdlInput.value[i]) {
        wdlInput.valueError = 'Value is required';
        wdlInput.valid = false;
        break;
      }
    }
  } else if (!wdlInput.value) {
    wdlInput.valueError = 'Value is required';
    wdlInput.valid = false;
  }
}

function validateInput(index, wdlInputs) {
  const wdlInput = wdlInputs[index];
  const other = wdlInputs.filter((input, i) => i !== index);
  wdlInput.valid = true;
  wdlInput.keyError = null;
  wdlInput.valueError = null;
  if (!wdlInput.key) {
    wdlInput.keyError = 'Name is required';
    wdlInput.valid = false;
  } else if (other.filter(o => o.key === wdlInput.key).length > 0) {
    wdlInput.keyError = 'Name should be unique';
    wdlInput.valid = false;
  }
  validateInputValue(wdlInput);
}

export default function (wdlInputs) {
  for (let i = 0; i < wdlInputs.length; i++) {
    validateInput(i, wdlInputs);
  }
}
