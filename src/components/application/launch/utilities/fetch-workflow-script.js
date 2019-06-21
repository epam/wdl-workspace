import {textFileProcessor} from '../../../../utils';
import fetchWorkflowDescription from './fetch-workflow-description';
import LoadFile from '../../../../models/executions/load-file';

export default async function (url, wdlInputs = []) {
  if (!url) {
    return {
      error: 'URL is not specified',
    };
  }
  const request = new LoadFile(url, textFileProcessor);
  await request.fetchIfNeededOrWait();
  if (request.error || request.failed) {
    let msg = request.error;
    if (!msg && request.response && request.response.status) {
      switch (request.response.status) {
        case 400:
          msg = 'Bad Request';
          break;
        case 401:
          msg = 'Unauthorized';
          break;
        case 403:
          msg = 'Forbidden';
          break;
        case 404:
          msg = 'Not found';
          break;
        case 408:
          msg = 'Request Timeout';
          break;
        case 503:
          msg = 'Server error: Service unavailable';
          break;
        default:
          msg = 'Failed to fetch';
      }
    }
    return {
      error: msg,
    };
  }
  if (request.value && (typeof request.value === 'string' || request.value instanceof String)) {
    const source = request.value;
    const description = await fetchWorkflowDescription(source, wdlInputs);
    return {
      description,
      source,
    };
  }
  return {
    error: 'Fetching failed: unknown content',
  };
}
