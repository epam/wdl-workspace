import {routes} from '../basic';
import LoadFile from './load-file';

async function generateDownloadUrl(path) {
  await routes.fetchIfNeededOrWait();
  if (routes.executionsConfigured) {
    const pathMaskRegExp = new RegExp(routes.executionsPathMask, 'i');
    const exec = pathMaskRegExp.exec(path);
    if (exec) {
      return `${routes.executionsURL}/${exec[1]}`;
    }
  }
  return null;
}

class LoadExecutionFile extends LoadFile {
  async fetch() {
    if (!this.urlReady) {
      const url = await generateDownloadUrl(this.url);
      if (!url) {
        this.error = `${this.url} not found`;
        this.failed = true;
        this._loaded = false;
        return;
      }
      this.url = url;
      this.urlReady = true;
    }
    await super.fetch();
  }

  async postprocess(value) {
    if (this.blobProcessor) {
      return this.blobProcessor(value.data);
    }
    return value.data;
  }
}

export {generateDownloadUrl};
export default LoadExecutionFile;
