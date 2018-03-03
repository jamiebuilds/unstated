// @flow
import React from 'react';
import { render } from 'react-dom';
import { Provider, Subscribe, Container, connect } from '../src/unstated';

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

function Counter({ count, increment, decrement }) {
  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => decrement()}>-</button>
      <button onClick={() => increment()}>+</button>
    </div>
  );
}

const ConnectedCounter = connect(
  [AppContainer, CounterContainer],
  (app, counter) => ({
    count: counter.state.count,
    decrement: () => counter.decrement(app.state.amount),
    increment: () => counter.increment(app.state.amount)
  })
)(Counter);

function App({ amount, setAmount }) {
  return (
    <div>
      <ConnectedCounter />
      <label>Amount: </label>
      <input
        type="number"
        value={amount}
        onChange={event => {
          setAmount(parseInt(event.currentTarget.value, 10));
        }}
      />
    </div>
  );
}

const ConnectedApp = connect(
  AppContainer,
  app => ({
    amount: app.state.amount,
    setAmount: value => app.setAmount(value)
  }),
  app => app.setAmount(2)
)(App);

render(
  <Provider>
    <ConnectedApp />
  </Provider>,
  window.connect
);
