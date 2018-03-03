// @flow
import React from 'react';
import { render } from 'react-dom';
import {
  Provider,
  Subscribe,
  Container,
  withSubscription
} from '../src/unstated';

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

const Counter = withSubscription({ counter: CounterContainer })(
  ({ counter }) => (
    <div>
      <button onClick={() => counter.decrement()}>-</button>
      <span>{counter.state.count}</span>
      <button onClick={() => counter.increment()}>+</button>
    </div>
  )
);

render(
  <Provider>
    <Counter />
  </Provider>,
  window.withSubscription
);
