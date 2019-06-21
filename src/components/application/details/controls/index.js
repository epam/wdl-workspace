import {SubTitle, Title} from './header';
import {navigateBackFn} from './actions';

const utilities = {
  navigateBackFn,
};

const WorkflowHeader = {
  SubTitle,
  Title,
};

export {WorkflowHeader, utilities};
export {default as WorkflowActions} from './actions';
export {default as WorkflowAssets} from './assets';
export {default as WorkflowFailures} from './failures';
export {default as WorkflowMainInfo} from './main-info';
export {default as WorkflowTasks} from './tasks';
