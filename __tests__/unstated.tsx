import * as React from 'react';
import { Provider, Subscribe, Container } from '../src/unstated';

class CounterContainer extends Container<{ count: number }> {
  state = { count: 0 };
  increment(amount = 1) {
    this.setState({ count: this.state.count + amount });
  }
  decrement(amount = 1) {
    this.setState({ count: this.state.count - amount });
  }
}

class AmounterContainer extends Container<{ amount: number }> {
  state = { amount: 1 };
  setAmount(amount) {
    this.setState({ amount });
  }
}

function Counter() {
  return (
    <Subscribe to={[CounterContainer]}>
      {(counter: CounterContainer) => (
        <div>
          <span>{counter.state.count}</span>
          <button onClick={() => counter.decrement()}>-</button>
          <button onClick={() => counter.increment()}>+</button>
        </div>
      )}
    </Subscribe>
  );
}

function CounterWithAmount() {
  return (
    <Subscribe to={[CounterContainer, AmounterContainer]}>
      {(counter: CounterContainer, amounter: AmounterContainer) => (
        <div>
          <span>{counter.state.count}</span>
          <button onClick={() => counter.decrement(amounter.state.amount)}>
            -
          </button>
          <button onClick={() => counter.increment(amounter.state.amount)}>
            +
          </button>
        </div>
      )}
    </Subscribe>
  );
}

function CounterWithAmountApp() {
  return (
    <Subscribe to={[AmounterContainer]}>
      {(amounter: AmounterContainer) => (
        <div>
          <Counter />
          <input
            type="number"
            value={amounter.state.amount}
            onChange={event => {
              amounter.setAmount(parseInt(event.currentTarget.value, 10));
            }}
          />
        </div>
      )}
    </Subscribe>
  );
}

const sharedAmountContainer = new AmounterContainer();

function CounterWithSharedAmountApp() {
  return (
    <Subscribe to={[sharedAmountContainer]}>
      {(amounter: AmounterContainer) => (
        <div>
          <Counter />
          <input
            type="number"
            value={amounter.state.amount}
            onChange={event => {
              amounter.setAmount(parseInt(event.currentTarget.value, 10));
            }}
          />
        </div>
      )}
    </Subscribe>
  );
}

let counter = new CounterContainer();
let render = () => (
  <Provider inject={[counter]}>
    <Counter />
  </Provider>
);
