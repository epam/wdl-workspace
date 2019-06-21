import {Remote, routes} from '../basic';

export const DIRECTORY = 'directory';
export const FILE = 'file';

function generateUrl(path, isDirectory = true) {
  if (routes.loaded && routes.workflowsConfigured) {
    let url = `${routes.workflows}`;
    if (!url.endsWith('/')) {
      url = `${url}/`;
    }
    if (path) {
      url = `${url}${path}`;
    }
    if (!url.endsWith('/') && isDirectory) {
      url = `${url}/`;
    } else if (url.endsWith('/') && !isDirectory) {
      url = url.substr(0, url.length - 1);
    }
    return url;
  }
  return null;
}

async function generateUrlAsync(path, isDirectory = true) {
  await routes.fetchIfNeededOrWait();
  return generateUrl(path, isDirectory);
}

export default class WorkflowListing extends Remote {
  path;

  constructor(path) {
    super();
    if (!this.constructor.fetchOptions) {
      this.constructor.fetchOptions = {
        mode: 'cors',
        credentials: 'include',
      };
    }
    this.constructor.fetchOptions.cache = 'no-cache';
    this.path = path;
  }

  async postprocess(value) {
    const wdlRegExp = /^(.+)\.wdl$/i;
    const filterWDL = (e) => {
      if (e.type === FILE) {
        return !!wdlRegExp.exec(e.name);
      }
      return false;
    };
    await routes.fetchIfNeededOrWait();
    const mapPath = e => ({
      ...e,
      path: this.path ? `${this.path}/${e.name}` : e.name,
    });
    const mapDownloadUrl = e => ({
      ...e,
      downloadUrl: generateUrl(e.path, e.type === DIRECTORY),
    });
    const mapWDL = (e, index, array) => {
      if (e.type === FILE) {
        const exec = wdlRegExp.exec(e.name);
        if (exec) {
          const wdlInputsRegExp = new RegExp(`${exec[1]}\\.inputs\\.json`, 'i');
          const readmeRegExp = new RegExp(`${exec[1]}\\.readme\\.md`, 'i');
          const [inputs] = array.filter(i => wdlInputsRegExp.test(i.name));
          const [readme] = array.filter(i => readmeRegExp.test(i.name));
          return {
            ...e,
            inputs,
            readme,
          };
        }
      }
      return e;
    };
    return (await super.postprocess(value))
      .map(mapPath)
      .map(mapDownloadUrl)
      .map(mapWDL)
      .filter(e => e.type === DIRECTORY || filterWDL(e));
  }

  async fetch() {
    this.url = await generateUrlAsync(this.path);
    if (!this.url) {
      this.error = `${this.path} not found`;
      this.failed = true;
      this._loaded = false;
      return;
    }
    await super.fetch();
  }
}
