import {textFileProcessor} from '../../../../utils';
import validateInputs from './wdl-inputs-validation';
import fetchWorkflowDescription from './fetch-workflow-description';
import WdlInputTypes from './wdl-input-types';

function processInputsObject(obj, callback) {
  const wdlInputs = Object.keys(obj)
    .map((key) => {
      if (Array.isArray(obj[key])) {
        return {
          key,
          optional: false,
          type: WdlInputTypes.array,
          value: obj[key],
        };
      }
      return {
        key,
        optional: false,
        type: WdlInputTypes.string,
        value: obj[key],
      };
    });
  validateInputs(wdlInputs);
  callback({
    wdlInputs,
  });
}

function processInputsString(str, callback) {
  try {
    const obj = JSON.parse(str);
    processInputsObject(obj, callback);
  } catch (e) {
    callback({
      error: e.toString(),
    });
  }
}

async function processWorkflowInputs(wdlInputs) {
  return new Promise((resolve) => {
    if (wdlInputs instanceof File) {
      textFileProcessor(wdlInputs)
        .then(i => processInputsString(i, resolve));
    } else if (typeof wdlInputs === 'string') {
      processInputsString(wdlInputs, resolve);
    } else {
      processInputsObject(wdlInputs, resolve);
    }
  });
}

async function processWorkflowScript(wdlScript) {
  return new Promise((resolve) => {
    const processScript = script => resolve({wdlSource: script});
    if (wdlScript instanceof File) {
      textFileProcessor(wdlScript)
        .then(processScript);
    } else {
      processScript(wdlScript);
    }
  });
}

export default async function ({script, inputs}, generateInputs) {
  const promises = [];
  if (script) {
    promises.push(processWorkflowScript(script));
  }
  if (inputs) {
    promises.push(processWorkflowInputs(inputs));
  }
  const values = await Promise.all(promises);
  const result = values.reduce((obj, current) => {
    obj.errors.push(current.error);
    Object.keys(current)
      .forEach((key) => {
        obj[key] = current[key];
      });
    return obj;
  }, {errors: []});
  if (!inputs && generateInputs && result.wdlSource) {
    const {error, workflow} = await fetchWorkflowDescription(result.wdlSource);
    result.errors.push(error);
    if (workflow && workflow.inputs && workflow.inputs.length) {
      result.wdlInputs = workflow.inputs;
    }
    result.wdlSourceValid = workflow.valid;
    result.wdlSourceErrors = workflow.errors || [];
  }
  return {
    ...result,
    error: result.errors.filter(Boolean).length > 0 ? result.errors.join('\n') : undefined,
  };
}
