import React from 'react'
import renderer from 'react-test-renderer'
import unstated, { Provider, Subscribe, Container } from '../index'

const INITIAL = 1234

interface CounterState {
  count: number
}

class CounterContainer extends Container<CounterState> {
  state: CounterState = { count: INITIAL }
  increment = (amount = 1) => {
    this.setState({ count: this.state.count + amount })
  }
  decrement = (amount = 1) => {
    this.setState({ count: this.state.count - amount })
  }
}

interface AmounterState {
  amount: number
}

class AmounterContainer extends Container<AmounterState> {
  state: AmounterState = { amount: INITIAL }
  setAmount(amount: number) {
    this.setState({ amount })
  }
}

test('counter container: provider without inject', async () => {
  const component = renderer.create(
    <Provider>
      <Subscribe to={[CounterContainer]}>
        {counter => (
          <div>
            <span>{counter.state.count}</span>
            <button onClick={() => counter.decrement()}>-</button>
            <button onClick={() => counter.increment()}>+</button>
          </div>
        )}
      </Subscribe>
    </Provider>
  )

  let tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL)
})

test('counter container: provider with inject', async () => {
  const counterContainer = new CounterContainer()
  const component = renderer.create(
    <Provider inject={[counterContainer]}>
      <Subscribe to={[CounterContainer]}>
        {counter => (
          <div>
            <span>{counter.state.count}</span>
            <button onClick={() => counter.decrement()}>-</button>
            <button onClick={() => counter.increment()}>+</button>
          </div>
        )}
      </Subscribe>
    </Provider>
  )

  let tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL)
  expect(counterContainer.state.count).toBe(INITIAL)
})

test('counter container: throw error if not wrap with Provider', async () => {
  expect(() => {
    renderer.create(
      <Subscribe to={[CounterContainer]}>
        {counter => (
          <div>
            <span>{counter.state.count}</span>
            <button onClick={() => counter.decrement()}>-</button>
            <button onClick={() => counter.increment()}>+</button>
          </div>
        )}
      </Subscribe>
    )
  }).toThrow()
})

test('counter container: subscribe directly to container instance', async () => {
  const counterContainer = new CounterContainer()
  const component = renderer.create(
    <Provider>
      <Subscribe to={[counterContainer]}>
        {counter => (
          <div>
            <span>{counter.state.count}</span>
            <button onClick={() => counter.decrement()}>-</button>
            <button onClick={() => counter.increment()}>+</button>
          </div>
        )}
      </Subscribe>
    </Provider>
  )

  let tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL)
  expect(counterContainer.state.count).toBe(INITIAL)
})

test('counter container: increase/decrease count', async () => {
  const counterContainer = new CounterContainer()
  const component = renderer.create(
    <Provider inject={[counterContainer]}>
      <Subscribe to={[CounterContainer]}>
        {counter => (
          <div>
            <span>{counter.state.count}</span>
            <button onClick={() => counter.decrement()}>-</button>
            <button onClick={() => counter.increment()}>+</button>
          </div>
        )}
      </Subscribe>
    </Provider>
  )

  let tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL)
  expect(counterContainer.state.count).toBe(INITIAL)

  await tree.children[1].props.onClick()  // decrease
  tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL - 1)
  expect(counterContainer.state.count).toBe(INITIAL - 1)

  await tree.children[2].props.onClick()  // increase
  tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL)
  expect(counterContainer.state.count).toBe(INITIAL)
})

test('counter container: should remove subscriber listeners if component is unmounted', () => {
  const counterContainer = new CounterContainer()
  const component = renderer.create(
    <Provider inject={[counterContainer]}>
      <Subscribe to={[CounterContainer]}>
        {counter => (
          <div>
            <span>{counter.state.count}</span>
            <button onClick={() => counter.decrement()}>-</button>
            <button onClick={() => counter.increment()}>+</button>
          </div>
        )}
      </Subscribe>
    </Provider>
  )

  const testInstance = component.root.findByType(Subscribe)._fiber.stateNode

  expect(testInstance._unmounted).toBe(false)
  expect(counterContainer._listeners.length).toBe(1)

  component.unmount()

  expect(testInstance._unmounted).toBe(true)
  expect(counterContainer._listeners.length).toBe(0)
})

test('multiple containers', async () => {
  const counterContainer = new CounterContainer()
  const amounterContainer = new AmounterContainer()
  const component = renderer.create(
    <Provider inject={[counterContainer, amounterContainer]}>
      <Subscribe to={[CounterContainer, AmounterContainer]}>
        {(counter, amounter) => (
          <div>
            <span>{counter.state.count}</span>
            <span>{amounter.state.amount}</span>
            <button onClick={() => counter.decrement()}>-</button>
            <button onClick={() => counter.increment()}>+</button>
            <button onClick={() => amounter.setAmount(5)}>Set amount to 5</button>
          </div>
        )}
      </Subscribe>
    </Provider>
  )

  let tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL)
  expect(parseInt(tree.children[1].children[0])).toBe(INITIAL)
  expect(counterContainer.state.count).toBe(INITIAL)
  expect(amounterContainer.state.amount).toBe(INITIAL)

  await tree.children[2].props.onClick()  // decrease
  tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL - 1)
  expect(counterContainer.state.count).toBe(INITIAL - 1)

  await tree.children[3].props.onClick()  // increase
  tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL)
  expect(counterContainer.state.count).toBe(INITIAL)

  await tree.children[4].props.onClick()  // set amount to 5
  tree = component.toJSON()
  expect(parseInt(tree.children[1].children[0])).toBe(5)
  expect(amounterContainer.state.amount).toBe(5)
})

interface ICounterProps {
  count: number
  decrement: () => void
  increment: () =>  void
}

test('unstated HOC: increase/decrease count', async () => {
  const counterContainer = new CounterContainer()

  const Counter = ({count, decrement, increment}: ICounterProps) => (
    <div>
      <span>{count}</span>
      <button onClick={() => decrement()}>-</button>
      <button onClick={() => increment()}>+</button>
    </div>
  )

  const UnstatedCounter = unstated(CounterContainer,
    counter => ({
      count: counter.state.count,
      decrement: counter.decrement,
      increment: counter.increment
    })
  )(Counter)

  const component = renderer.create(
    <Provider inject={[counterContainer]}>
      <UnstatedCounter />
    </Provider>
  )

  let tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL)
  expect(counterContainer.state.count).toBe(INITIAL)

  await tree.children[1].props.onClick()  // decrease
  tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL - 1)
  expect(counterContainer.state.count).toBe(INITIAL - 1)

  await tree.children[2].props.onClick()  // increase
  tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL)
  expect(counterContainer.state.count).toBe(INITIAL)
})

test('unstated HOC: without map to props: increase/decrease count', async () => {
  const counterContainer = new CounterContainer()

  const Counter = ({ counterContainer }: { counterContainer: CounterContainer }) => (
    <div>
      <span>{counterContainer.state.count}</span>
      <button onClick={() => counterContainer.decrement()}>-</button>
      <button onClick={() => counterContainer.increment()}>+</button>
    </div>
  )

  const UnstatedCounter = unstated(CounterContainer)(Counter)

  const component = renderer.create(
    <Provider inject={[counterContainer]}>
      <UnstatedCounter />
    </Provider>
  )

  let tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL)
  expect(counterContainer.state.count).toBe(INITIAL)

  await tree.children[1].props.onClick()  // decrease
  tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL - 1)
  expect(counterContainer.state.count).toBe(INITIAL - 1)

  await tree.children[2].props.onClick()  // increase
  tree = component.toJSON()
  expect(parseInt(tree.children[0].children[0])).toBe(INITIAL)
  expect(counterContainer.state.count).toBe(INITIAL)
})

test('unstated HOC: copy static methods', async () => {
  const Counter = ({ counterContainer }: { counterContainer: CounterContainer }) => (
    <div>
      <span>{counterContainer.state.count}</span>
      <button onClick={() => counterContainer.decrement()}>-</button>
      <button onClick={() => counterContainer.increment()}>+</button>
    </div>
  )

  Counter.staticMethod = () => 9876

  const UnstatedCounter = unstated(CounterContainer)(Counter)

  expect((UnstatedCounter as any).staticMethod()).toBe(9876)
})

class DummyContainer extends Container<{}> {
  setStateWithNull() {
    this.setState(null)
  }

  setStateWithUpdaterReturnNull() {
    this.setState(state => null)
  }

  setStateWithUndefined() {
    this.setState()
  }

  setStateWithEmptyOjbect() {
    this.setState({})
  }
}

test('enforce re-render unless bail out with null', async () => {
  let renderCount = 0

  const component = renderer.create(
    <Provider>
      <Subscribe to={[DummyContainer]}>
        {dummy => {
          renderCount += 1

          return (
            <div>
              <button onClick={() => dummy.setStateWithNull()}>Set state with null</button>
              <button onClick={() => dummy.setStateWithUpdaterReturnNull()}>Set state with updater return null</button>
              <button onClick={() => dummy.setStateWithUndefined()}>Set state with undefined</button>
              <button onClick={() => dummy.setStateWithEmptyOjbect()}>Set state with empty object</button>
            </div>
          )
        }}
      </Subscribe>
    </Provider>
  )

  expect(renderCount).toBe(1)  // first render

  let tree = component.toJSON()
  await tree.children[0].props.onClick()  // should bail out re-render
  expect(renderCount).toBe(1)

  tree = component.toJSON()
  await tree.children[1].props.onClick()  // should bail out re-render
  expect(renderCount).toBe(1)

  tree = component.toJSON()
  await tree.children[2].props.onClick()  // should re-render on falsy value except null
  expect(renderCount).toBe(2)

  tree = component.toJSON()
  await tree.children[3].props.onClick()  // should re-render on falsy value except null
  expect(renderCount).toBe(3)
})
