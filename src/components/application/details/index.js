import React from 'react';
import {inject, observer} from 'mobx-react';
import {
  Alert,
  PageHeader,
} from 'antd';

import {
  utilities,
  WorkflowActions,
  WorkflowAssets,
  WorkflowFailures,
  WorkflowHeader,
  WorkflowMainInfo,
  WorkflowTasks,
} from './controls';
import {
  ACTION_TIMINGS_KEY,
  ACTION_VIEW_MODE_KEY,
} from './controls/actions';
import {
  ACTION_ABORT_KEY,
  ACTION_DETAILS_KEY,
  ACTION_RELAUNCH_KEY,
  ACTION_RELEASE_ON_HOLD_KEY,
} from '../common/workflow-actions';
import {
  Loading,
  processQueryString,
} from '../../utilities';
import {reloadWorkflow} from './utilities';

import '../../../static-styles/page-header-styles.css';
import styles from './details.css';

@inject('filesCache', 'routes')
@inject(({workflowCache}, {location, match}) => {
  const id = match?.params?.id;
  const jobId = `${match?.params?.job || ''}` || null;
  const mode = match?.params?.mode || 'plain';
  const query = processQueryString(location);
  const from = query.from || '';
  const launching = query.launching === 'true';
  return {
    from,
    launching,
    id,
    jobId,
    mode,
    rootUrl: `/run/${id}/${mode}${location.search || ''}`,
    workflow: id ? workflowCache.getWorkflow(id) : null,
  };
})
@reloadWorkflow
@observer
class Details extends React.Component {
  state = {
    details: false,
  };

  actionCallback = (action, info) => {
    switch (action) {
      case ACTION_DETAILS_KEY:
        this.setState({
          details: info.details,
        });
        break;
      case ACTION_ABORT_KEY:
      case ACTION_RELEASE_ON_HOLD_KEY:
        if (!info.navigated) {
          const {workflow} = this.props;
          workflow.fetch();
        }
        break;
      case ACTION_VIEW_MODE_KEY:
      case ACTION_TIMINGS_KEY:
      case ACTION_RELAUNCH_KEY:
      default:
        break;
    }
  };

  render() {
    const {
      history,
      from,
      jobId,
      launching,
      mode,
      routes,
      rootUrl,
      workflow,
    } = this.props;
    const {details} = this.state;
    if (!workflow) {
      return <Alert type="error" message="Workflow id not specified" />;
    }
    if (workflow.error && !launching) {
      return <Alert type="error" message={workflow.error} />;
    }
    if (workflow.error && launching) {
      return <Loading />;
    }
    if (workflow.pending && !workflow.loaded) {
      return <Loading />;
    }
    return (
      <PageHeader
        className="workflow-details-header"
        title={<WorkflowHeader.Title workflow={workflow} />}
        subTitle={<WorkflowHeader.SubTitle workflow={workflow} />}
        onBack={utilities.navigateBackFn(this.props)}
        extra={(
          <WorkflowActions
            callback={this.actionCallback}
            workflow={workflow}
            history={history}
            options={{
              details,
              from,
              jobId,
              launching,
              mode,
            }}
          />
        )}
      >
        <div className={styles.workflowDetails}>
          <WorkflowMainInfo workflow={workflow} />
          <WorkflowFailures workflow={workflow} />
          <WorkflowAssets routes={routes} workflow={workflow} />
          <WorkflowTasks
            rootUrl={rootUrl}
            workflow={workflow}
            history={history}
            details={details}
            from={from}
            jobId={jobId}
            mode={mode}
          />
        </div>
      </PageHeader>
    );
  }
}

export default Details;
