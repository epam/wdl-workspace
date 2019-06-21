import {observable, action, computed} from 'mobx';
import {defer} from '../../utils';

class Remote {
  static apiVersion = 'v1';

  static defaultValue = {};

  static fetchOptions = {
    mode: 'cors',
    credentials: 'include',
  };

  static prefix = '';

  static getPrefix = () => Remote.prefix;

  static auto = false;

  static isJson = true;

  url;

  @observable failed = false;

  @observable error = undefined;

  onDataReceived;

  constructor() {
    if (this.constructor.auto) {
      this.fetch();
    }
  }

  @observable _pending = true;

  @computed
  get pending() {
    this._fetchIfNeeded();
    return this._pending;
  }

  @observable _loaded = false;

  @computed
  get loaded() {
    this._fetchIfNeeded();
    return this._loaded;
  }

  @observable _value = this.constructor.defaultValue;

  @computed
  get value() {
    this._fetchIfNeeded();
    return this._value;
  }

  @observable _response = undefined;

  @computed
  get response() {
    this._fetchIfNeeded();
    return this._response;
  }

  _loadRequired = !this.constructor.auto;

  async _fetchIfNeeded() {
    if (this._loadRequired) {
      this._loadRequired = false;
      await this.fetch();
    }
  }

  async fetchIfNeededOrWait() {
    if (this._loadRequired) {
      await this._fetchIfNeeded();
    } else if (this._fetchPromise) {
      await this._fetchPromise;
    }
  }

  invalidateCache() {
    this._loadRequired = true;
  }

  _fetchPromise = null;

  async fetch() {
    this._loadRequired = false;
    if (!this._fetchPromise) {
      this._fetchPromise = new Promise(async (resolve) => {
        this._pending = true;
        const {getPrefix, fetchOptions} = this.constructor;
        const prefix = getPrefix();
        try {
          await defer();
          let {headers} = fetchOptions;
          if (!headers) {
            headers = {};
          }
          fetchOptions.headers = headers;
          const response = await fetch(`${prefix}${this.url}`, fetchOptions);
          const data = this.constructor.isJson ? (await response.json()) : (await response.blob());
          await this.update({
            data,
            status: response.status,
          });
        } catch (e) {
          this.failed = true;
          this.error = e.toString();
        }

        this._pending = false;
        this._fetchPromise = null;
        resolve();
        if (this.onDataReceived) {
          this.onDataReceived(this);
        }
      });
    }
    return this._fetchPromise;
  }

  // eslint-disable-next-line class-methods-use-this
  async postprocess(value) {
    return value.data;
  }

  @action
  async update(value) {
    this._response = value;
    if (value.status && value.status === 401) {
      this.error = (value.data ? value.data.message : undefined) || value.message;
      this.failed = true;
    } else if (value.status && value.status === 200) {
      this._value = await this.postprocess(value);
      this._loaded = true;
      this.error = undefined;
      this.failed = false;
    } else {
      this.error = (value.data ? value.data.message : undefined) || value.message;
      this.failed = true;
      this._loaded = false;
    }
  }
}

export default Remote;
