<div align="center">
  <br><br><br><br><br>
  <img src="https://raw.githubusercontent.com/thejameskyle/unstated/master/logo.png" alt="Unstated Logo" width="400">
  <br><br><br><br><br><br><br><br>
</div>

# Unstated

> State so simple, it goes without saying

## Installation

```sh
yarn add unstated
```

## Example

```js
// @flow
import React from 'react';
import { render } from 'react-dom';
import { Provider, Subscribe, Container } from 'unstated';

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

render(
  <Provider>
    <Counter />
  </Provider>,
  document.getElementById('root')
);
```

For more examples, see the `example/` directory.

## Happy Customers

<h4 align="center">
  "Unstated is a breath of fresh air for state management. I rewrote my whole app to use it yesterday."
  <br><br>
  <a href="https://twitter.com/sindresorhus">Sindre Sorhus</a>
</h4>

<h4 align="center">
  "When people say you don't need Redux most of the time, they actually mean you do need Unstated.<br>It's like setState on fucking horse steroids"
  <br><br>
  <a href="https://twitter.com/ken_wheeler">Ken Wheeler</a> (obviously)
</h4>

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

###### `setState()`

`setState()` in `Container` mimics React's `setState()` method as closely as
possible.

```js
class CounterContainer extends Container {
  state = { count: 0 };
  increment = () => {
    this.setState(
      state => {
        return { count: state.count + 1 };
      },
      () => {
        console.log('Updated!');
      }
    );
  };
}
```

It's also run asynchronously, so you need to follow the same rules as React.

**Don't read state immediately after setting it**

```js
class CounterContainer extends Container {
  state = { count: 0 };
  increment = () => {
    this.setState({ count: 1 });
    console.log(this.state.count); // 0
  };
}
```

**If you are using previous state to calculate the next state, use the function form**

```js
class CounterContainer extends Container {
  state = { count: 0 };
  increment = () => {
    this.setState(state => {
      return { count: state.count + 1 };
    });
  };
}
```

However, unlike React's `setState()` Unstated's `setState()` returns a promise,
so you can `await` it like this:

```js
class CounterContainer extends Container {
  state = { count: 0 };
  increment = async () => {
    await this.setState({ count: 1 });
    console.log(this.state.count); // 1
  };
}
```

Async functions are now available in [all the major browsers](https://caniuse.com/#feat=async-functions),
but you can also use [Babel](http://babeljs.io) to compile them down to
something that works in every browser.

##### `<Subscribe>`

Next we'll need a piece to introduce our state back into the tree so that:

* When state changes, our components re-render.
* We can depend on our container's state.
* We can call methods on our container.

For this we have the `<Subscribe>` component which allows us to pass our
container classes/instances and receive instances of them in the tree.

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
test('counter', async () => {
  let counter = new CounterContainer();
  assert(counter.state.count === 0);

  await counter.increment();
  assert(counter.state.count === 1);

  await counter.decrement();
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

  await click(tree, '#increment');
  assert(counter.state.count === 1);

  await click(tree, '#decrement');
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

  await click(tree, '#increment');
  assert(inc.calls.length === 1);
  assert(dec.calls.length === 0);
});
```

We don't even have to do anything to clean up after ourselves because we just
throw everything out afterwards.

## FAQ

#### What state should I put into Unstated?

The React community has focused a lot on trying to put all their state in one
place. You could keep doing that with Unstated, but I wouldn't recommend it.

I would recommend a multi-part solution.

First, use local component state as much as you possibly can. That counter
example from above never should have been refactored away from component
state, it was fine before Unstated.

Second, use libraries to abstract away the bits of state that you'll repeat
over and over.

Like if form state has you down, you might want to use a library like
[Final Form](https://github.com/final-form/react-final-form).

If fetching data is getting to be too much, maybe try out [Apollo](https://www.apollographql.com).
Or even something uncool but familiar and reliable like [Backbone models and collections](http://backbonejs.org).
What? Are you too cool to use an old framework?

Third, a lot of shared state between components is localized to a few
components in the tree.

```js
<Tabs>
  <Tab>One</Tab>
  <Tab>Two</Tab>
  <Tab>Three</Tab>
</Tabs>
```

For this, I recommend using React's built-in `React.createContext()` API
and being careful in designing the API for the base components you create.

> **Note:** If you're on an old version of React and want to use the new
> context API, [I've got you](https://github.com/thejameskyle/create-react-context/)

Finally, (and only after other things are exhausted), if you really need
some global state to be shared throughout your app, you can use Unstated.

I know all of this might sound somehow more complicated, but it's a
matter of using the right tool for the job and not forcing a single
paradigm on the entire universe.

Unstated isn't ambitious, use it as you need it, it's nice and small for
that reason. Don't think of it as a "Redux killer". Don't go trying to
build complex tools on top of it. Don't reinvent the wheel. Just try it
out and see how you like it.

#### Passing your own instances directly to `<Subscribe to>`

If you want to use your own instance of a container directly to `<Subscribe>`
and you don't care about dependency injection, you can do so:

<!-- prettier-ignore -->
```js
let counter = new CounterContainer();

function Counter() {
  return (
    <Subscribe to={[counter]}>
      {counter => <div>...</div>}
    </Subscribe>
  );
}
```

You just need to keep a couple things in mind:

1. You are opting out of dependency injection, you won't be able to
   `<Provider inject>` another instance in your tests.
2. Your instance will be local to whatever `<Subscribe>`'s you pass it to, you
   will end up with multiple instances of your container if you don't pass the
   same reference in everywhere.

Also remember that it is _okay_ to use `<Provider inject>` in your application
code, you can pass your instance in there. It's probably better to do that in
most scenarios anyways (cause then you get dependency injection and all that
good stuff).

#### How can I pass in options to my container?

A good pattern for doing this might be to add a constructor to your container
which accepts `props` sorta like React components. Then create your own
instance of your container and pass it into `<Provide inject>`.

```js
class CounterContainer extends Container {
  constructor(props = {}) {
    super();
    this.state = {
      amount: props.initialAmount || 1,
      count: 0
    };
  }

  increment = () => {
    this.setState({ count: this.state.count + this.state.amount });
  };
}

let counter = new CounterContainer({
  initialAmount: 5
});

render(
  <Provide inject={[counter]}>
    <Counter />
  </Provide>
);
```
