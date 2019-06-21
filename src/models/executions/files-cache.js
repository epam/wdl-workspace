import LoadExecutionFile from './load-execution-file';
import LoadFile from './load-file';

class FilesCache {
  static getCache(cache, Model, path, blobProcessorFn) {
    if (!cache.has(path)) {
      cache.set(path, new Model(path, blobProcessorFn));
    }
    return cache.get(path);
  }

  filesCache = new Map();

  getFileContents(url, blobProcessorFn) {
    return this.constructor.getCache(this.filesCache, LoadFile, url, blobProcessorFn);
  }

  getExecutionFileContents(path, blobProcessorFn) {
    if (!path) {
      return null;
    }
    return this.constructor.getCache(this.filesCache, LoadExecutionFile, path, blobProcessorFn);
  }
}

export default FilesCache;
