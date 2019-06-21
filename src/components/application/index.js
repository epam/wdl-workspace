import React from 'react';
import {Provider} from 'mobx-react';
import {createHashHistory} from 'history';
import AU from 'ansi_up';

import workflows from '../../models/workflows';
import {filesCache} from '../../models/executions';
import {workflowCache} from '../../models/workflow';
import routes from '../../models/basic/routes';

import AppRouter from './app-router';

const history = createHashHistory({});
const ansiUp = new AU();

const stores = {
  ansiUp,
  history,
  workflows,
  filesCache,
  routes,
  workflowCache,
};

export default function () {
  return (
    <Provider
      {...stores}
    >
      <AppRouter />
    </Provider>
  );
}
