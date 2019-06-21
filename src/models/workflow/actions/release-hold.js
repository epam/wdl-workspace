import {ApiRemotePost} from '../../basic-api';

class ReleaseHold extends ApiRemotePost {
  constructor(id) {
    super();
    this.url = `/workflows/${this.constructor.apiVersion}/${id}/releaseHold`;
  }
}

export default ReleaseHold;
