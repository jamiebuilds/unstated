// @flow
import React from 'react';
import assert from 'assert';
import renderer from 'react-test-renderer';
import { Provider, Subscribe, Container } from '../src/unstated';

function render(element) {
  return renderer.create(element).toJSON();
}

async function click({ children = [] }, id) {
  const el = children.find(({ props = {} }) => props.id === id);
  el.props.onClick();
}

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
      {counter => (
        <div>
          <span>{counter.state.count}</span>
          <button id="decrement" onClick={() => counter.decrement()}>
            -
          </button>
          <button id="increment" onClick={() => counter.increment()}>
            +
          </button>
        </div>
      )}
    </Subscribe>
  );
}

function CounterWithAmount() {
  return (
    <Subscribe to={[CounterContainer, AmounterContainer]}>
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

function CounterWithAmountApp() {
  return (
    <Subscribe to={[AmounterContainer]}>
      {amounter => (
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

test('counter', async () => {
  let counter = new CounterContainer();
  let tree = render(
    <Provider inject={[counter]}>
      <Counter />
    </Provider>
  );

  assert.equal(counter.state.count, 0);

  await click(tree, 'increment');
  assert.equal(counter.state.count, 1);

  await click(tree, 'decrement');
  assert.equal(counter.state.count, 0);
});
