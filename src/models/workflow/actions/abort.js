import {ApiRemotePost} from '../../basic-api';

class AbortWorkflow extends ApiRemotePost {
  constructor(id) {
    super();
    this.url = `/workflows/${this.constructor.apiVersion}/${id}/abort`;
  }
}

export default AbortWorkflow;
