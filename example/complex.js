// @flow
import React from 'react';
import { render } from 'react-dom';
import { Provider, Subscribe, Container } from '../src/unstated';

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
          <span>Count: {counter.state.count}</span>
          <button onClick={() => counter.decrement(app.state.amount)}>-</button>
          <button onClick={() => counter.increment(app.state.amount)}>+</button>
        </div>
      )}
    </Subscribe>
  );
}

function App() {
  return (
    <Subscribe to={[AppContainer]}>
      {app => (
        <div>
          <Counter />
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

render(
  <Provider>
    <App />
  </Provider>,
  window.complex
);
