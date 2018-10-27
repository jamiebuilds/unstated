// @flow
import React from 'react';
import { render } from 'react-dom';
import { Provider, Subscribe, Container, useUnstated } from '../src/unstated';

type CounterState = {
  count: number
};

class CounterContainer extends Container<CounterState> {
  state = { count: 0 };

  increment() {
    this.setState({ count: this.state.count + 1 });
  }

  decrement() {
    this.setState({ count: this.state.count - 1 });
  }
}

function Counter() {
  return (
    <Subscribe to={[CounterContainer]}>
      {counter => (
        <div>
          <label>Using Subscribe: </label>
          <button onClick={() => counter.decrement()}>-</button>
          <span>{counter.state.count}</span>
          <button onClick={() => counter.increment()}>+</button>
        </div>
      )}
    </Subscribe>
  );
}

function CounterUsingHook() {
  const [counter] = useUnstated(CounterContainer);
  return (
    <div>
      <label>Using Hook: </label>
      <button onClick={() => counter.decrement()}>-</button>
      <span>{counter.state.count}</span>
      <button onClick={() => counter.increment()}>+</button>
    </div>
  );
}

render(
  <Provider>
    <Counter />
    <CounterUsingHook />
  </Provider>,
  window.simple
);
