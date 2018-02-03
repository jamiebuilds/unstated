<div align="center">
  <br><br><br><br><br>
  <img src="https://raw.githubusercontent.com/thejameskyle/unstated/master/logo.png" alt="Unstated Logo" width="400">
  <br><br><br><br><br><br><br><br>
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

For more examples, see the `example/` directory.

## Guide

If you're like me, you're sick of all the ceremony around state management in
React. Something that fits in well with the React way of thinking, but doesn't
command some crazy architecture and methodology.

Component state is nice! It makes sense and people pick it up quickly:

```js
class Counter extends React.Component {
  state = { count: 0 };
  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };
  decrement = () => {
    this.setState({ count: this.state.count - 1 });
  };
  render() {
    return (
      <div>
        <span>{this.state.count}</span>
        <button onClick={this.decrement}>-</button>
        <button onClick={this.increment}>+</button>
      </div>
    );
  }
}
```

As a new React developer you might not know exactly how everything works, but
you can get a general sense pretty quickly.

The only problem here is that we can't easily share this state with other
components in our tree. Which is intentional! React components are designed to
be very self-contained.

What would be great is if we could replicate the nice parts of React's
component state API while sharing it across multiple components.

But how do we share values between components in React? Through "context".

> **Note:** The following is part of the new `React.createContext` API
> [described in this RFC](https://github.com/reactjs/rfcs/blob/master/text/0002-new-version-of-context.md).

```js
const Amount = React.createContext(1);

class Counter extends React.Component {
  state = { count: 0 };
  increment = amount => { this.setState({ count: this.state.count + amount }); };
  decrement = amount => { this.setState({ count: this.state.count - amount }); };
  render() {
    return (
      <Amount.Consumer>
        {amount => (
          <div>
            <span>{this.state.count}</span>
            <button onClick={() => this.decrement(amount)}>-</button>
            <button onClick={() => this.increment(amount)}>+</button>
          </div>
        )}
      </Amount.Consumer>
    );
  }
}

class AmountAdjuster extends React.Component {
  state = { amount: 0 };
  handleChange = event => {
    this.setState({
      amount: parseInt(event.currentTarget.value, 10)
    });
  };
  render() {
    return (
      <Amount.Provider value={this.state.amount}>
        <div>
          {this.props.children}
          <input type="number" value={this.state.amount} onChange={this.handleChange}/>
        </div>
      </Amount.Provider>
    );
  }
}

render(
  <AmountAdjuster>
    <Counter/>
  </AmountAdjuser>
);
```

This is already pretty great. Once you get a little bit used to React's way of
thinking, it makes total sense and it's very predictable.

But can we build on this pattern to make something even nicer?

### Introducing Unstated

Well this is where Unstated comes in.

Unstated is designed to build on top of the patterns already set out by React
components and context.

It has three pieces:

##### `Container`

We're going to want another place to store our state and some of the logic for
updating it.

`Container` is a very simple class which is meant to look just like
`React.Component` but with only the state-related bits: `this.state` and
`this.setState`.

```js
class CounterContainer extends Container {
  state = { count: 0 };
  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };
  decrement = () => {
    this.setState({ count: this.state.count - 1 });
  };
}
```

Behind the scenes our `Container`s are also event emitters that our app can
subscribe to for updates. When you call `setState` it triggers components to
re-render, be careful not to mutate `this.state` directly or your components
won't re-render.

##### `<Subscribe>`

Next we'll need a piece to introduce our state back into the tree so that:

* When state changes, our components re-render.
* We can depend on our container's state.
* We can call methods on our container.

For this we have the `<Subscribe>` component which allows us to pass our
container classes and receive instances of them in the tree.

```js
function Counter() {
  return (
    <Subscribe to={[CounterContainer]}>
      {counter => (
        <div>
          <span>{counter.state.count}</span>
          <button onClick={counter.decrement}>-</button>
          <button onClick={counter.increment}>+</button>
        </div>
      )}
    </Subscribe>
  );
}
```

`<Subscribe>` will automatically construct our container and listen for changes.

##### `<Provider>`

The final piece that we'll need is something to store all of our instances
internally. For this we have `<Provider>`.

```js
render(
  <Provider>
    <Counter />
  </Provider>
);
```

We can do some interesting things with `<Provider>` as well like dependency
injection:

```js
let counter = new CounterContainer();

render(
  <Provider inject={[counter]}>
    <Counter />
  </Provider>
);
```

### Testing

Whenever we consider the way that we write the state in our apps we should be
thinking about testing.

We want to make sure that our state containers have a clean way

Well because our containers are very simple classes, we can construct them in
tests and assert different things about them very easily.

```js
test('counter', () => {
  let counter = new CounterContainer();
  assert(counter.state.count === 0);

  counter.increment();
  assert(counter.state.count === 1);

  counter.decrement();
  assert(counter.state.count === 0);
});
```

If we want to test the relationship between our container and the component
we can again construct our own instance and inject it into the tree.

```js
test('counter', () => {
  let counter = new CounterContainer();
  let tree = render(
    <Provider inject={[counter]}>
      <Counter />
    </Provider>
  );

  click(tree, '#increment');
  assert(counter.state.count === 1);

  click(tree, '#decrement');
  assert(counter.state.count === 0);
});
```

Dependency injection is useful in many ways. Like if we wanted to stub out a
method in our state container we can do that painlessly.

```js
test('counter', () => {
  let counter = new CounterContainer();
  let inc = stub(counter, 'increment');
  let dec = stub(counter, 'decrement');

  let tree = render(
    <Provider inject={[counter]}>
      <Counter />
    </Provider>
  );

  click(tree, '#increment');
  assert(inc.calls.length === 1);
  assert(dec.calls.length === 0);
});
```

We don't even have to do anything to clean up after ourselves because we just
throw everything out afterwards.
