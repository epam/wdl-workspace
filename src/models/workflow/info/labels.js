import {ApiRemote} from '../../basic-api';

class WorkflowLabels extends ApiRemote {
  constructor(id) {
    super();
    this.url = `/workflows/${this.constructor.apiVersion}/${id}/labels`;
  }
}

export default WorkflowLabels;
