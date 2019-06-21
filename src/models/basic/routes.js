// LoadRoutes class provides logic for downloading Routes Configuration file,
// specified by WW_ROUTES_CONFIG_URL.
// This file is (generously) generated during app build stage, but can be created
// manually as well.
// Routes Configuration file MUST be of following structure:
// {
//   "api": "http://server/api", <- REQUIRED, specifies API url
//   "executions": {
//     "url": "http://server/executions", <- REQUIRED, specifies url for downloading cromwell logs & outputs
//     "path_mask": "^.*\\/cromwell-executions\\/(.+)$" <- optional, RegExp string, specifies path to cromwell executions root directory at server
//   },
//     "workflows": {
//     "listing_url": "http://server/pipelines" <- optional, specifies url for listing predefined workflows
//   }
// }
//
// This file is generated during app build stage using specified ENV vars and then
// is copied to app build's root (as 'routes.json'), so by default it can be downloaded using
// http://js-app-host-server/<js app root path>/routes.json.

import {computed} from 'mobx';
import Remote from './remote';

class LoadRoutes extends Remote {
  constructor() {
    super();
    this.constructor.fetchOptions.cache = 'no-cache';
    this.url = process.env.WW_ROUTES_CONFIG_URL;
    this.fetch();
  }

  @computed
  get api() {
    return this.loaded && this.value.api;
  }

  @computed
  get executionsConfigured() {
    return this.loaded && this.value.executions && !!this.value.executions.url;
  }

  @computed
  get workflowsConfigured() {
    return this.loaded && this.value.workflows && !!this.value.workflows.listing_url;
  }

  @computed
  get executionsURL() {
    if (this.executionsConfigured) {
      return this.value.executions.url;
    }
    return null;
  }

  @computed
  get executionsPathMask() {
    if (this.executionsConfigured) {
      return this.value.executions.path_mask || '^.*\\/cromwell-executions\\/(.+)$';
    }
    return null;
  }

  @computed
  get workflows() {
    if (this.workflowsConfigured) {
      return this.value.workflows.listing_url;
    }
    return null;
  }
}

export default new LoadRoutes();
