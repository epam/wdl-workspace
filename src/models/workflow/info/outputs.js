import {ApiRemote} from '../../basic-api';

class WorkflowOutputs extends ApiRemote {
  constructor(id) {
    super();
    this.url = `/workflows/${this.constructor.apiVersion}/${id}/outputs`;
  }
}

export default WorkflowOutputs;
