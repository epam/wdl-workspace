import {ApiRemote} from '../basic-api';

class Query extends ApiRemote {
  constructor() {
    super();
    this.url = `/workflows/${this.constructor.apiVersion}/query`;
  }
}

export default new Query();
