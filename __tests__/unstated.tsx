import * as React from 'react';
import { Provider, Subscribe, Carrier } from '../src/unstated';

class CounterCarrier extends Carrier<{ count: number }> {
  state = { count: 0 };
  increment(amount = 1) {
    this.setState({ count: this.state.count + amount });
  }
  decrement(amount = 1) {
    this.setState({ count: this.state.count - amount });
  }
}

class AmounterCarrier extends Carrier<{ amount: number }> {
  state = { amount: 1 };
  setAmount(amount: number) {
    this.setState({ amount });
  }
}

function Counter() {
  return (
    <Subscribe to={[CounterCarrier]}>
      {(counter: CounterCarrier) => (
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
    <Subscribe to={[CounterCarrier, AmounterCarrier]}>
      {(counter: CounterCarrier, amounter: AmounterCarrier) => (
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
    <Subscribe to={[AmounterCarrier]}>
      {(amounter: AmounterCarrier) => (
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

const sharedAmountCarrier = new AmounterCarrier();

function CounterWithSharedAmountApp() {
  return (
    <Subscribe to={[sharedAmountCarrier]}>
      {(amounter: AmounterCarrier) => (
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

let counter = new CounterCarrier();
let render = () => (
  <Provider inject={[counter]}>
    <Counter />
  </Provider>
);
