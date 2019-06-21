import {ApiRemote} from '../../basic-api';

class WorkflowStatus extends ApiRemote {
  constructor(id) {
    super();
    this.url = `/workflows/${this.constructor.apiVersion}/${id}/status`;
  }
}

export default WorkflowStatus;
