import {Remote, RemotePost, routes} from '../basic';

export class ApiRemote extends Remote {
  constructor() {
    super();
    this.constructor.getPrefix = () => routes.api || this.constructor.prefix;
  }
}

export class ApiRemotePost extends RemotePost {
  constructor() {
    super();
    this.constructor.getPrefix = () => routes.api || this.constructor.prefix;
  }
}
