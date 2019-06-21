import React from 'react';
import {Button} from 'antd';

export const ACTION_VIEW_MODE_KEY = 'details';

function switchMode(event, workflow, history, callback, options) {
  event.preventDefault();
  event.stopPropagation();
  const {
    from,
    jobId,
    launching,
    mode,
  } = options || {};
  const newMode = /^graph$/i.test(mode) ? 'plain' : 'graph';
  const jobIdPath = jobId ? `/${jobId}` : '';
  const launchingMode = launching ? 'launching=true' : null;
  const fromParam = from ? `from=${from}` : null;
  const queryParams = [fromParam, launchingMode].filter(Boolean);
  const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  if (history) {
    history.push(`/run/${workflow?.id}/${newMode}${jobIdPath}${query}`);
  }
  if (callback) {
    callback(ACTION_VIEW_MODE_KEY, {mode: newMode, navigated: !!history, id: workflow.id});
  }
}

export default function (
  {
    callback,
    history,
    options,
    style,
    type,
    workflow,
  },
) {
  if (!workflow) {
    return null;
  }
  const {mode} = options || {};
  return (
    <Button
      key="view_mode_switcher"
      size="small"
      type={type}
      style={style}
      onClick={(e) => switchMode(e, workflow, history, callback, options)}
    >
      {/^graph$/i.test(mode) ? 'Plain view' : 'Graph view'}
    </Button>
  );
}
