import {ApiRemote} from '../../basic-api';
import {routes} from '../../basic';

export default class TimingDiagram extends ApiRemote {
  constructor(id) {
    super();
    this.url = `/workflows/${this.constructor.apiVersion}/${id}/timing`;
  }

  static getTimingsUrl(id) {
    return `${routes.api || TimingDiagram.prefix}/workflows/${TimingDiagram.apiVersion}/${id}/timing`;
  }
}
