# WDL WORKSPACE

`WDL Workspace` solution provides a Web-based User Interface for [Cromwell](https://github.com/broadinstitute/cromwell) server.
- **Launch wdl script**: upload, select from library or edit wdl script, inputs and options
- **Workflow execution process**: observe workflow's status, inputs, outputs, logs etc

## How to build WDL Workspace

### Requirements

- [**Node.js**](https://nodejs.org) >=6.11.5
- [**npm**](https://www.npmjs.com)

### Build configuration

During build process following *env variables* are used:
- **WW_CROMWELL_API**: url for `Cromwell` server's API, e.g. `http://localhost:8000/api`, `https://some.server.com/cromwell/api`
- **WW_CROMWELL_EXECUTIONS_PATH_MASK**: regular expression with capture group; this expression describes path to cromwell workflow's execution directory at server (/some/root/directory/**cromwell-executions**); capture group is used to extract relative path to workflow execution's assets (i.e. /some/root/directory/cromwell-executions/**workflow/abcd1234/call-a/stdout**). Default value: `^.*\\/cromwell-executions\\/(.+)$`
- **WW_CROMWELL_EXECUTIONS_URL**: url for `Cromwell` server's execution folder, e.g. `http://some.server.com/cromwell/executions`, `/executions`; this variable is used with `WW_CROMWELL_EXECUTIONS_PATH_MASK` to generate url for downloading workflow's assets
- **WW_WORKFLOWS_URL**: url for pre-distributed workflows ("Workflows library")
- **WW_ROUTES_CONFIG_URL**: url for downloading `routes.json`; this file is generated automatically and contains all endpoints for GUI. Default value: `/routes.json`

All this variables can be set using *npm run script* arguments:
- **--api**=*WW_CROMWELL_API*
- **--executions-path-mask**=*WW_CROMWELL_EXECUTIONS_PATH_MASK*
- **--executions-url**=*WW_CROMWELL_EXECUTIONS_URL*
- **--workflows-url**=*WW_WORKFLOWS_URL*
- **--routes-config-url**=*WW_ROUTES_CONFIG_URL*

Build process requires **WW_CROMWELL_API** (or `npm run script --api=...`) to be set.

### Build for production

To build WDL Workspace run this commands in source code directory:

````
$ npm install
$ npm run build
````

This will produce `build` folder with app's assets.

### Build for development

To build WDL Workspace for development run this commands in source code directory:

````
$ npm install
$ npm run start
````

or if you have cromwell server running on local machine (at http://localhost:8000/api) run:

````
$ npm install
$ npm run start-with-local-cromwell
````

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Documentation

- [Running WDL workspace using docker](./docker/README.md)
