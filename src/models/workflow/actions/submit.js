import {ApiRemotePost} from '../../basic-api';

class Submit extends ApiRemotePost {
  constructor() {
    super();
    this.url = `/workflows/${this.constructor.apiVersion}`;
    delete this.constructor.fetchOptions.headers;
  }
}

export default Submit;
