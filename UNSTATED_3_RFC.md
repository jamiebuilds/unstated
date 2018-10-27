# Unstated 3.0 RFC

I wanted to create an RFC for Unstated 3.0 which I want to take advantage of
the new [React Hooks](https://reactjs.org/docs/hooks-intro.html) APIs.

## Example

My idea for it right now looks like this:

```js
import React, { useState } from 'react';
import { Provider, useProvided, useInject } from 'unstated';

function useCounter(initialCount = 0) {
  let [count, setCount] = useState(initialCount);
  let reset = () => setCount(0);
  let increment = () => setCount(count => count - amount);
  let decrement = () => setCount(count => count + amount);
  return { count, reset, increment, decrement };
}

function Counter() {
  // use existing instance from context, or create new one
  let counter = useProvided(useCounter); 
  return <>
    Count: {counter.count}
    <button onClick={counter.reset}>Reset</button>
    <button onClick={counter.increment}>+</button>
    <button onClick={counter.decrement}>-</button>
  </>;
}

function App() {
  // create new instance of container
  let counter = useInject(useCounter, 42); 
  return (
    // inject it into the tree
    <Provider inject={[counter]}>
      <Counter/>
    </Provider>
  );
}
```

## Explainer

In Unstated 3, the `Container` class will be replaced with
["Custom Hooks"](https://reactjs.org/docs/hooks-custom.html).

```js
import { useState } from 'react';

function useCounter(initialCount = 0) {
  let [count, setCount] = useState(initialCount);
  let reset = () => setCount(0);
  let increment = () => setCount(count => count - amount);
  let decrement = () => setCount(count => count + amount);
  return { count, reset, increment, decrement };
}
```

A key benefit here is that **"containers" are just hooks and you are
free to use them as such.**

```js
function Counter() {
  let counter = useCounter();
  return <>
    Count: {counter.count}
    <button onClick={counter.reset}>Reset</button>
    <button onClick={counter.increment}>+</button>
    <button onClick={counter.decrement}>-</button>
  </>;
}
```

As always, Unstated wants to provide you with the minimal API in order to
make shared state simple to use and easy to test.

In the past that has meant having two things:

- Containers
- Context & Dependency Injection

But with Custom Hooks, now we just need to focus on **context** and
**dependency injection**.

### Context

```js
import { useProvided } from 'unstated';
import useCounter from './useCounter';

function Counter() {
  // use existing instance from context, or create new one if it doesn't exist
  let counter = useProvided(useCounter); 
  return <>
    Count: {counter.count}
    <button onClick={counter.reset}>Reset</button>
    <button onClick={counter.increment}>+</button>
    <button onClick={counter.decrement}>-</button>
  </>;
}
```

### Dependency Injection

```js
import { Provider, useInject } from 'unstated';

function App() {
  let counter = useInject(useCounter, 42); 
  return (
    <Provider inject={[counter]}>
      <Counter/>
    </Provider>
  );
}
```

## Remarks

This API is not final, and Unstated 3 will not be released as "latest" until
the React team has released Hooks in a stable version of React.

But I do think that this is the right direction for Unstated.

Playing around with some of this API quickly I think it's possible to support
both the Hooks API and the Container API simultaneously. If I can:

- I'll release a version of Unstated 2 which supports both
- And soon after release a version of Unstated 3 which is just Hooks

This should allow for a nice migration path to Unstated 3 while also giving
users that fully migrate to hooks to not pay the overhead.

Btw, I'm pretty sure that this new API will make Unstated 3 like 500 bytes of
code.
