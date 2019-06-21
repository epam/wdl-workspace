// Fires `callback` function every `timeout`:
// callback(<component props>, <component state>, ...args)
export default function (callback, timeout, ...args) {
  return (WrappedComponent) => {
    class WrappedComponentReload extends WrappedComponent {
      constructor() {
        super();
        if (!this.reloadEntries) {
          this.reloadEntries = [];
        }
        const index = this.reloadEntries.length + 1;
        const timerName = `reloadTimer_${index}`;
        this.reloadEntries.push({
          callback,
          timeout,
          timerName,
        });
      }

      timerElapsed = (name) => {
        const [reloadEntry] = this.reloadEntries.filter(e => e.timerName === name);
        if (reloadEntry) {
          reloadEntry.callback(this.props, this.state, ...args);
        }
      };

      componentDidMount() {
        super.componentDidMount();
        for (let i = 0; i < this.reloadEntries.length; i++) {
          const reloadEntry = this.reloadEntries[i];
          if (!reloadEntry.timer) {
            reloadEntry.callback(this.props, this.state, ...args);
            reloadEntry.timer = setInterval(
              this.timerElapsed,
              reloadEntry.timeout,
              reloadEntry.timerName,
            );
          }
        }
      }

      componentWillUnmount() {
        super.componentWillUnmount();
        clearInterval(this.timer);
        for (let i = 0; i < this.reloadEntries.length; i++) {
          const reloadEntry = this.reloadEntries[i];
          clearInterval(reloadEntry.timer);
        }
      }
    }
    return WrappedComponentReload;
  };
}
