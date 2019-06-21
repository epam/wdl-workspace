/* eslint-disable */

const wdlWorkspaceEnvs = require('./wdl-workspace.envs');
const chalk = require('react-dev-utils/chalk');

// A JavaScript class.
class WDLWorkspaceRoutesPlugin {
  constructor (options) {
    this.options = options || {};
  }
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'WDLWorkspaceRoutesPlugin',
      (compilation, callback) => {
        console.log('Generating `routes.json`...');
        const routesJson = this.buildRoutesObject();
        if (routesJson) {
          console.log(JSON.stringify(routesJson, null, ' '));
          const content = JSON.stringify(routesJson);
          compilation.assets['routes.json'] = {
            source: function () {
              return content;
            },
            size: function () {
              return content.length;
            }
          };
          console.log('`routes.json` generated.');
        } else {
          console.log(chalk.yellow('Generation of `routes.json` skipped'));
        }
        callback();
      }
    )
  }
  buildRoutesObject() {
    const {env} = this.options;
    const result = {};
    const keys = Object.keys(wdlWorkspaceEnvs);
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const key = keys[keyIndex];
      const value = wdlWorkspaceEnvs[key];
      if (!value.routesJsonProperty) {
        continue;
      }
      const propValue = env && env[key] ? env[key] : value.default;
      if (!propValue) {
        if (value.required) {
          console.log(chalk.yellow(`${key} value is missing`));
          return null;
        } else {
          continue;
        }
      }
      const paths = value.routesJsonProperty.split('.');
      let obj = result;
      for (let i = 0; i < paths.length; i++) {
        if (!obj[paths[i]]) {
          obj[paths[i]] = {};
        }
        if (i < paths.length - 1) {
          obj = obj[paths[i]];
        } else {
          obj[paths[i]] = propValue;
        }
      }
    }
    return result;
  }
}

module.exports = WDLWorkspaceRoutesPlugin;
