import {Remote} from '../basic';

export default class LoadFile extends Remote {
  blobProcessor;

  constructor(url, blobProcessor) {
    super();
    this.constructor.isJson = false;
    if (!this.constructor.fetchOptions) {
      this.constructor.fetchOptions = {
        mode: 'cors',
        credentials: 'include',
      };
    }
    this.constructor.fetchOptions.cache = 'no-cache';
    this.blobProcessor = blobProcessor;
    this.url = url;
  }

  async postprocess(value) {
    if (this.blobProcessor) {
      return this.blobProcessor(value.data);
    }
    return value.data;
  }
}
