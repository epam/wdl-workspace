import {observable, action, computed} from 'mobx';
import {defer} from '../../utils';

class RemotePost {
  static apiVersion = 'v1';

  static fetchOptions = {
    mode: 'cors',
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8;',
    },
  };

  static prefix = '';

  static getPrefix = () => RemotePost.prefix;

  static auto = false;

  static isJson = true;

  static noResponse = false;

  url;

  @observable _pending = false;

  @computed
  get pending() {
    return this._pending;
  }

  @observable _loaded = false;

  @computed
  get loaded() {
    return this._loaded;
  }

  @observable _response = undefined;

  @computed
  get response() {
    return this._response;
  }

  async fetch() {
    await this.send({});
  }

  _fetchIsExecuting = false;

  async send(body, stringified = true) {
    if (!this._postIsExecuting) {
      this._pending = true;
      this._postIsExecuting = true;
      const {getPrefix, fetchOptions} = this.constructor;
      const prefix = getPrefix();
      try {
        await defer();
        let {headers} = fetchOptions;
        if (!headers) {
          headers = {};
        }
        fetchOptions.headers = headers;
        let stringifiedBody;
        try {
          stringifiedBody = stringified ? JSON.stringify(body) : body;
        } catch (___) {} // eslint-disable-line
        const response = await fetch(
          `${prefix}${this.url}`,
          {...fetchOptions, body: stringifiedBody},
        );
        if (!this.constructor.noResponse) {
          const data = this.constructor.isJson ? (await response.json()) : (await response.blob());
          this.update({
            data,
            status: response.status,
          });
        } else {
          this.update({status: 'OK', data: {}});
        }
      } catch (e) {
        this.failed = true;
        this.error = e.toString();
      } finally {
        this._postIsExecuting = false;
      }

      this._pending = false;
      this._fetchIsExecuting = false;
    }
  }

  static postprocess(value) {
    return value.data;
  }

  @action
  update(value) {
    this._response = value;
    if (value.status && value.status === 401) {
      this.error = (value.data ? value.data.message : undefined) || value.message;
      this.failed = true;
    } else if (value.status && (value.status === 200 || value.status === 201)) {
      this._value = RemotePost.postprocess(value);
      this._loaded = true;
      this.error = undefined;
      this.failed = false;
    } else {
      this.error = (value.data ? value.data.message : undefined) || value.message;
      this.failed = true;
      this._loaded = false;
    }
  }

  get value() {
    return this._value;
  }
}

export default RemotePost;
