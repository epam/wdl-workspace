import React from 'react';
import dateFns from 'date-fns';
import DetailsLog from './details-log';
import {displayDate} from '../../../../../utils';

export default function (
  {
    tasks,
    workflow,
  },
) {
  if (!workflow?.loaded || !tasks) {
    return null;
  }
  const [selected] = tasks
    // eslint-disable-next-line
    .map((task) => task.scatter ? task.jobs : [task])
    .reduce((array, jobs) => ([...array, ...jobs]), [])
    .filter(t => t.selected);
  if (!selected) {
    return null;
  }
  const executionEvents = (selected.executionEvents || [])
    .slice();
  executionEvents
    .sort((eA, eB) => dateFns.compareAsc(new Date(eA.startTime), new Date(eB.startTime)));
  return (
    <DetailsLog
      predefinedLogs={executionEvents.map(e => `[${displayDate(e.startTime)}] ${e.description}`)}
      stdoutPath={selected.stdout}
      stderrPath={selected.stderr}
      task={selected}
    />
  );
}
