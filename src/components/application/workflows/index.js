import React, {Component} from 'react';
import {computed} from 'mobx';
import {inject, observer} from 'mobx-react/index';
import {
  Button,
  PageHeader,
  Typography,
} from 'antd';
import {FilterWorkflows, WorkflowTable} from './controls';
import {filterWorkflowsFn, reloadWorkflows} from './utilities';
import '../../../static-styles/page-header-styles.css';

const pageSize = 20;

@inject(({workflows}, {match}) => ({
  workflows,
  status: match?.params?.status,
}))
@reloadWorkflows
@observer
class Workflows extends Component {
  state = {
    activeRuns: 0,
    currentPage: 1,
  };

  @computed
  get filteredWorkflows() {
    const {status, workflows} = this.props;
    if (workflows.loaded) {
      return (workflows.value.results || []).filter(filterWorkflowsFn(status));
    }
    return [];
  }

  reloadTable = async () => {
    const {workflows} = this.props;
    if (workflows) {
      await workflows.fetch();
    }
  };

  handleTableChange = (pagination) => {
    const {activeRuns} = this.state;
    const {current} = pagination;
    this.setState({
      activeRuns,
      currentPage: current,
    });
  };

  onSelectWorkflow = (workflow) => {
    const {history, status} = this.props;
    if (history && workflow) {
      history.push(`/run/${workflow.id}/plain?from=${status}`);
    }
  };

  onReLaunchWorkflow = (workflow) => {
    const {history, status} = this.props;
    if (history && workflow) {
      history.push(`/relaunch-workflow/${workflow.id}?from=${status}`);
    }
  };

  onChangeStatus = (status) => {
    const {history} = this.props;
    history.push(`/runs/${status}`);
  };

  onSubmitNewWorkflow = () => {
    const {history} = this.props;
    history.push('/launch');
  };

  render() {
    const {status, workflows} = this.props;
    const {currentPage} = this.state;

    return (
      <div style={{padding: 5}}>
        <PageHeader
          className="workflow-submissions-header"
          title={(
            <Typography.Title level={3}>
              Workflow submissions
            </Typography.Title>
          )}
          extra={[
            <Button
              key="launch"
              type="primary"
              size="small"
              onClick={this.onSubmitNewWorkflow}
            >
              Submit new workflow
            </Button>,
          ]}
          footer={(
            <FilterWorkflows onChange={this.onChangeStatus} status={status} />
          )}
        />
        <div style={{marginTop: -1}}>
          <WorkflowTable
            useFilter
            loading={workflows.pending && !workflows.loaded}
            reloadTable={this.reloadTable}
            dataSource={this.filteredWorkflows}
            handleTableChange={this.handleTableChange}
            onSelect={this.onSelectWorkflow}
            onReLaunch={this.onReLaunchWorkflow}
            runDetailsUrl={run => `/run/${run.id}/plain?from=${status}`}
            pagination={{
              total: this.filteredWorkflows.length,
              pageSize,
              current: currentPage,
            }}
          />
        </div>
      </div>
    );
  }
}

export default Workflows;
