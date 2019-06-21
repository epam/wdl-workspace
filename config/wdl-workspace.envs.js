/* eslint-disable */
'use strict';

const wdlWorkspaceEnvs = {
  WW_CROMWELL_API: {
    argument: 'api',
    description: 'Cromwell API url',
    required: true,
    routesJsonProperty: 'api'
  },
  WW_CROMWELL_EXECUTIONS_PATH_MASK: {
    argument: 'executions-path-mask',
    default: '^.*\\/cromwell-executions\\/(.+)$',
    description: 'Cromwell executions assets path mask; RegExp string with capturing group for asset\'s uri (see WW_CROMWELL_EXECUTIONS_URL)',
    required: false,
    routesJsonProperty: 'executions.path_mask'
  },
  WW_CROMWELL_EXECUTIONS_URL: {
    argument: 'executions-url',
    description: 'Specifies url for cromwell executions root folder; execution asset\'s url will be generated as combination of WW_CROMWELL_EXECUTIONS_URL and capture result of WW_CROMWELL_EXECUTIONS_PATH_MASK',
    required: false,
    routesJsonProperty: 'executions.url'
  },
  WW_ROUTES_CONFIG_URL: {
    argument: 'routes-config-url',
    default: 'routes.json',
    description: 'Routes json download url',
    required: false,
    routesJsonProperty: false
  },
  WW_WORKFLOWS_URL: {
    argument: 'workflows-url',
    description: 'Predefined workflows browsing url',
    required: false,
    routesJsonProperty: 'workflows.listing_url'
  }
};

module.exports = wdlWorkspaceEnvs;
