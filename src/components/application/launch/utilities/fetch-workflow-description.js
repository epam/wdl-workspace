import DescribeWorkflowRequest from '../../../../models/womtool/describe-workflow';
import validateInputs from './wdl-inputs-validation';
import WdlInputTypes from './wdl-input-types';

function processSuggestedInputs(workflowName, inputs, prevInputs) {
  if (!inputs) {
    return null;
  }
  const newWdlInputs = inputs.map((input) => {
    const isArray = input.typeDisplayName.startsWith('Array');
    const key = `${workflowName}.${input.name}`;
    const type = isArray ? WdlInputTypes.array : WdlInputTypes.string;
    let value;
    const [existed] = prevInputs.filter(w => w.key === key);
    if (existed && existed.value) {
      value = existed.value;
    }
    if (!value && input.default) {
      value = JSON.parse(input.default);
    } else if (!value) {
      value = isArray ? [''] : '';
    }
    return {
      key,
      type,
      value,
      optional: input.optional,
      isGenerated: true,
    };
  });
  if (newWdlInputs.length === 0) {
    return null;
  }
  newWdlInputs.push(...prevInputs.filter(
    w => !w.isGenerated
      && newWdlInputs.filter(nw => nw.key === w.key).length === 0,
  ));
  return newWdlInputs;
}


export default async function (source, wdlInputs = []) {
  const formData = new FormData();
  formData.append(
    'workflowSource',
    source,
  );
  const request = new DescribeWorkflowRequest();
  await request.send(formData, false);
  const {
    error,
    value,
  } = request;
  if (error) {
    return {
      fetchError: error,
    };
  }
  const {
    errors,
    inputs,
    name,
    valid,
  } = value;
  const processWdlInputs = processSuggestedInputs(
    name,
    (inputs || []).filter(i => !i.name.includes('.')),
    wdlInputs,
  );
  if (processWdlInputs) {
    validateInputs(processWdlInputs);
  }
  return {
    workflow: {
      errors,
      name,
      inputs: processWdlInputs || wdlInputs,
      valid,
    },
  };
}
