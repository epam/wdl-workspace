import {ApiRemote} from '../../basic-api';

class WorkflowLogs extends ApiRemote {
  constructor(id) {
    super();
    this.url = `/workflows/${this.constructor.apiVersion}/${id}/logs`;
  }
}

export default WorkflowLogs;
