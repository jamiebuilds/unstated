// @flow
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider, Subscribe, Container } from '../src/unstated';

const noop = () => {};

Enzyme.configure({ adapter: new Adapter() });

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

test('component with Subscribe renders fine', () => {
  const wrapper = mount(
    <Provider>
      <Counter />
    </Provider>
  );
  expect(wrapper).toMatchSnapshot();
});

test("component can change container's state", () => {
  const wrapper = mount(
    <Provider>
      <Counter />
    </Provider>
  );
  expect(wrapper).toMatchSnapshot();
  const incButton = wrapper.find('button').last();
  incButton.simulate('click');
  incButton.simulate('click');
  expect(wrapper).toMatchSnapshot();
});

test("throws when not in a Provider's subtree", () => {
  const consoleError = console.error;
  console.error = noop;
  expect(() => mount(<Counter />)).toThrowErrorMatchingSnapshot();
  console.error = consoleError;
});

test('Subscribes share Containers instances', () => {
  const wrapper = mount(
    <Provider>
      <Counter />
      <Counter />
      <Counter />
    </Provider>
  );
  expect(wrapper).toMatchSnapshot();
  const incButton = wrapper
    .find(Counter)
    .first()
    .find('button')
    .last();
  incButton.simulate('click');
  incButton.simulate('click');
  expect(wrapper).toMatchSnapshot();
});
