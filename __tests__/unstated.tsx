import * as React from 'react';
import { Provider, Subscribe, Container, useUnstated } from '../src/unstated';

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
  setAmount(amount: number) {
    this.setState({ amount });
  }
}

function Counter() {
  return (
    <Subscribe to={[CounterContainer]}>
      {(counter) => (
        <div>
          <span>{counter.state.count}</span>
          <button onClick={() => counter.decrement()}>-</button>
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
      <span>{counter.state.count}</span>
      <button onClick={() => counter.decrement()}>-</button>
      <button onClick={() => counter.increment()}>+</button>
    </div>
  )
}
function CounterWithAmount() {
  return (
    <Subscribe<[CounterContainer, AmounterContainer]> to={[CounterContainer, AmounterContainer]}>
      {(counter, amounter) => (
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
function CounterWithAmountAlt() {
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
function CounterWithAmountUsingHook() {
  const [counter, amounter] = useUnstated(CounterContainer, AmounterContainer);
  return (
    <div>
      <span>{counter.state.count}</span>
      <button onClick={() => counter.decrement(amounter.state.amount)}>
        -
          </button>
      <button onClick={() => counter.increment(amounter.state.amount)}>
        +
          </button>
    </div>
  );
}

function CounterWithAmountApp() {
  return (
    <Subscribe to={[AmounterContainer]}>
      {(amounter) => (
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

function CounterWithAmountAppUsingHook() {
  const [amounter] = useUnstated(AmounterContainer);

  return (
    <div>
      <Counter />
      <CounterUsingHook />
      <input
        type="number"
        value={amounter.state.amount}
        onChange={event => {
          amounter.setAmount(parseInt(event.currentTarget.value, 10));
        }}
      />
    </div>
  );
}

const sharedAmountContainer = new AmounterContainer();

function CounterWithSharedAmountApp() {
  return (
    <Subscribe to={[sharedAmountContainer]}>
      {(amounter) => (
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
function CounterWithSharedAmountAppUsingHook() {
  const [amounter] = useUnstated(sharedAmountContainer);
  return (
    <div>
      <Counter />
      <CounterUsingHook />
      <input
        type="number"
        value={amounter.state.amount}
        onChange={event => {
          amounter.setAmount(parseInt(event.currentTarget.value, 10));
        }}
      />
    </div>
  );
}
let counter = new CounterContainer();
let render = () => (
  <Provider inject={[counter]}>
    <Counter />
    <CounterUsingHook />
  </Provider>
);
