import {ApiRemote} from '../../basic-api';

class WorkflowMetadata extends ApiRemote {
  constructor(id) {
    super();
    this.url = `/workflows/${this.constructor.apiVersion}/${id}/metadata`;
  }
}

export default WorkflowMetadata;
