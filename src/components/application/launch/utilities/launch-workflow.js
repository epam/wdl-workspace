import SubmitWorkflow from '../../../../models/workflow/actions/submit';

export const WDLOptionKeys = {
  labels: 'labels',
  options: 'workflowOptions',
  dependencies: 'workflowDependencies',
};

export default async function (launchOptions) {
  const {
    inputs,
    options,
    script,
  } = launchOptions;
  const request = new SubmitWorkflow();
  const formData = new FormData();
  formData.append(
    'workflowInputs',
    JSON.stringify(
      inputs.reduce((result, current) => {
        result[current.key] = current.value;
        return result;
      }, {}),
    ),
  );
  formData.append(
    'workflowSource',
    script,
  );
  formData.append(
    'workflowOnHold',
    options && options.launchOnHold,
  );
  const allOptions = Object.values(WDLOptionKeys);
  for (let i = 0; i < allOptions.length; i++) {
    const option = allOptions[i];
    if (options && Object.hasOwnProperty.call(options, option) && options[option]) {
      formData.append(option, options[option]);
    }
  }
  await request.send(formData, false);
  if (request.error) {
    return {
      error: request.error,
    };
  }
  return {
    id: request.value?.id,
  };
}
