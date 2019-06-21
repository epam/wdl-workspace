import React from 'react';
import {LocaleProvider} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import {observer} from 'mobx-react';

@observer
export default class App extends React.Component {
  state = {
    error: null,
    hasError: false,
  };

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return {hasError: true};
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.log(error, info);
    this.setState({
      error,
    });
  }

  render() {
    const {error, hasError} = this.state;
    const {children} = this.props;
    if (hasError) {
      return (
        <div id="root-container">
          <h1>Something went wrong</h1>
          <pre>
            {error && error.toString()}
          </pre>
        </div>
      );
    }
    return (
      <LocaleProvider locale={enUS}>
        <div id="root-container">
          {children}
        </div>
      </LocaleProvider>
    );
  }
}
