import {action, computed, observable} from 'mobx';
import Metadata from './info/metadata';
import TimingDiagram from './info/timing';

class Workflow {
  @observable metadata;

  @observable id;

  @observable timingsUrl;

  constructor(id, silent = false) {
    this.id = id;
    this.metadata = new Metadata(id);
    this.timingsUrl = TimingDiagram.getTimingsUrl(id);

    if (!silent) {
      this.metadata.fetch();
    }
  }

  @computed
  get pending() {
    return this.metadata?.pending;
  }

  @computed
  get loaded() {
    return this.metadata?.loaded;
  }

  @computed
  get error() {
    return this.metadata?.error;
  }

  @computed
  get name() {
    if (this.metadata?.loaded && this.metadata.value.workflowName) {
      return `${this.metadata.value.workflowName} (${this.metadata.value.id})`;
    }
    return this.id;
  }

  @computed
  get status() {
    if (this.metadata?.loaded) {
      return this.metadata.value.status;
    }
    return null;
  }

  @action
  reload = async () => this.metadata.fetch();
}

export default Workflow;
