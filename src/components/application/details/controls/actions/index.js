import React from 'react';
import {
  Abort,
  Details,
  ReLaunch,
  ReleaseOnHold,
} from '../../../common/workflow-actions';
import Timings, {ACTION_TIMINGS_KEY} from './action-timings';
import SwitchMode, {ACTION_VIEW_MODE_KEY} from './action-view-mode';

export {default as navigateBackFn} from './navigate-back';
export {
  ACTION_TIMINGS_KEY,
  ACTION_VIEW_MODE_KEY,
};

export default function (
  {
    callback,
    history,
    workflow,
    options,
  },
) {
  return [
    <Abort
      key="abort"
      callback={callback}
      workflow={workflow}
    />,
    <ReleaseOnHold
      key="release on hold"
      callback={callback}
      history={history}
      workflow={workflow}
    />,
    <ReLaunch
      key="relaunch"
      callback={callback}
      history={history}
      options={options}
      workflow={workflow}
    />,
    <Details
      key="details"
      callback={callback}
      workflow={workflow}
      options={options}
    />,
    <SwitchMode
      key="view mode"
      callback={callback}
      history={history}
      options={options}
      workflow={workflow}
    />,
    <Timings
      key="timings"
      callback={callback}
      workflow={workflow}
    />,
  ].filter(Boolean);
}
