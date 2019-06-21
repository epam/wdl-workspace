import {ApiRemotePost} from '../basic-api';

export default class DescribeWorkflow extends ApiRemotePost {
  constructor() {
    super();
    this.url = `/womtool/${this.constructor.apiVersion}/describe`;
    delete this.constructor.fetchOptions.headers;
  }
}
