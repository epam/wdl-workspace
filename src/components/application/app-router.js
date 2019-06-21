import React from 'react';
import {
  Redirect,
  Route,
  Router,
  Switch,
} from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import {Alert} from 'antd';

import App from './app';
import Workflows from './workflows';
import Details from './details';
import LaunchPage from './launch';
import {Loading} from '../utilities';

export default inject('history', 'routes')(observer(({history, routes}) => {
  if (routes.pending && !routes.loaded) {
    return (
      <div style={{width: '100vw', height: '100vh'}}>
        <Loading />
      </div>
    );
  }
  if (routes.error) {
    return (
      <Alert type="error" message={routes.error} />
    );
  }
  if (!routes.api) {
    return (
      <Alert type="error" message="API url not specified" />
    );
  }
  return (
    <Router history={history}>
      <App>
        <Switch>
          <Redirect exact from="/" to="/runs" />
          <Redirect exact from="/runs" to="/runs/active" />
          <Route path="/runs/:status" component={Workflows} />
          <Redirect exact from="/run/:id" to="/run/:id/plain" />
          <Route path="/run/:id/:mode/:job?" component={Details} />
          <Route path="/relaunch-workflow/:id" component={LaunchPage} />
          <Route path="/launch" component={LaunchPage} />
        </Switch>
      </App>
    </Router>
  );
}));
