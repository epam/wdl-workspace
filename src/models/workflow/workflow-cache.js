import Workflow from './workflow';

class WorkflowCache {
  static getCache(cache, id) {
    if (!cache.has(id)) {
      cache.set(id, new Workflow(id));
    }
    return cache.get(id);
  }

  workflowCache = new Map();

  getWorkflow(id) {
    if (!id) {
      return null;
    }
    return this.constructor.getCache(this.workflowCache, id);
  }
}

export default WorkflowCache;
