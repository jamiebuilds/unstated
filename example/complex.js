// @flow
import React from 'react';
import { render } from 'react-dom';
import { Provider, Subscribe, Container, useUnstated } from '../src/unstated';

type AppState = {
  amount: number
};

class AppContainer extends Container<AppState> {
  state = {
    amount: 1
  };

  setAmount(amount: number) {
    this.setState({ amount });
  }
}

type CounterState = {
  count: number
};

class CounterContainer extends Container<CounterState> {
  state = {
    count: 0
  };

  increment(amount: number) {
    this.setState({ count: this.state.count + amount });
  }

  decrement(amount: number) {
    this.setState({ count: this.state.count - amount });
  }
}

function Counter() {
  return (
    <Subscribe to={[AppContainer, CounterContainer]}>
      {(app, counter) => (
        <div>
          <span>Count using Subscribe: {counter.state.count}</span>
          <button onClick={() => counter.decrement(app.state.amount)}>-</button>
          <button onClick={() => counter.increment(app.state.amount)}>+</button>
        </div>
      )}
    </Subscribe>
  );
}

function HookCounter() {
  const [app, counter] = useUnstated(AppContainer, CounterContainer);
  return (
    <div>
      <span>Count using Hook: {counter.state.count}</span>
      <button onClick={() => counter.decrement(app.state.amount)}>-</button>
      <button onClick={() => counter.increment(app.state.amount)}>+</button>
    </div>
  );
}
function App() {
  return (
    <Subscribe to={[AppContainer]}>
      {app => (
        <div>
          <label>App Using Subscribe: </label>
          <Counter />
          <HookCounter />
          <label>Amount: </label>
          <input
            type="number"
            value={app.state.amount}
            onChange={event => {
              app.setAmount(parseInt(event.currentTarget.value, 10));
            }}
          />
        </div>
      )}
    </Subscribe>
  );
}
function HookApp() {
  const [app] = useUnstated(AppContainer);
  return (
    <div>
      <label>App Using Hook: </label>
      <Counter />
      <HookCounter />
      <label>Amount: </label>
      <input
        type="number"
        value={app.state.amount}
        onChange={event => {
          app.setAmount(parseInt(event.currentTarget.value, 10));
        }}
      />
    </div>
  );
}
render(
  <Provider>
    <App />
    <hr />
    <HookApp />
  </Provider>,
  window.complex
);
