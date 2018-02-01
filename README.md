<div align="center">
  <img src="https://raw.githubusercontent.com/thejameskyle/unstated/master/logo.png" alt="Unstated Logo" width="400">
</div>

# Unstated

> State ain't shit

## Installation

```sh
yarn add unstated
```

## Example

```js
import React from 'react';
import { render } from 'react-dom';
import { Subscribe, Container } from 'unstated';

type CounterState = {
  count: number
};

class CounterContainer extends Container<CounterState> {
  state = {
    count: 0
  };

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
          <button onClick={() => counter.decrement()}>-</button>
          <span>{counter.state.count}</span>
          <button onClick={() => counter.increment()}>+</button>
        </div>
      )}
    </Subscribe>
  );
}

render(<Counter />, document.getElementById('root'));
```

## API

### `Container`

`Container` is a base class for you to extend with your own methods and state.
The API is designed to look just like React Component's except it doesn't have
all the stuff related to rendering.

```js
class CounterContainer extends Container {
  state = { count: 0; };
  increment() {
    this.setState({ count: this.state.count + 1 });
  }
}
```

Just like a `React.Component` class, you can have a `state` property which is
an object with whatever you want inside.

Inside of your methods you can call `setState(nextState)` whenever you want. It
works just like React's `setState` method.

### `<Subscribe>`

`Subscribe` is a component for adding states to your React tree.

```js
<Subscribe to={[CounterContainer]}>
  {counter => (
    ...
  )}
</Subscribe>
```

You pass the containers you want to subscribe to into the `to` property. Then
in your children function (render prop) you'll receive instances of your
containers.

These instances might come from a parent component, otherwise it will create
its own instances. These instances will then be passed through React's context
to any child components.

##### `<Provide>`

Unstated will create its own instances of your containers internally. But if
you want to provide your own instances (perhaps for dependency injection in
tests), you can do that with `<Provide>`.

```js
test('counter', () => {
  let counter = new CounterContainer();
  assert(counter.state.count === 0);

  counter.increment();
  assert(counter.state.count === 1);

  let tree = render(
    <Provide inject={[counter]}>
      <Counter />
    </Provide>
  );

  click(tree, '#increment');
  assert(counter.state.count === 2);

  click(tree, '#decrement');
  assert(counter.state.count === 1);
});
```

`<Provide>` accepts `inject` property which should be an array of container
instances to be passed to all the children.
