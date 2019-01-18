<div align="center">
  <br><br><br><br><br>
  <img src="https://raw.githubusercontent.com/thejameskyle/unstated/master/logo.png" alt="Unstated Logo" width="400">
  <br><br><br><br><br><br><br><br>
</div>

# Unstated

> 不消说，状态管理就是如此简单！

[ENGLISH](../README.md)

## 安装

```sh
yarn add unstated
```

## 例子

```jsx
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

更多例子, 请看 `example/` 文件夹.

## 用户说

<h4 align="center">
  "Unstated 是状态管理工具中的一股清流啊！俺昨天用它重写了整个项目！"
  <br><br>
  <a href="https://twitter.com/sindresorhus">Sindre Sorhus</a>
</h4>

<h4 align="center">
  "当人们喊着大部分时候你都不需要用redux时，他们实际上在说你需要Unstated。<br>setState用起来像嗑了药一样爽啊！"
  <br><br>
  <a href="https://twitter.com/ken_wheeler">Ken Wheeler</a> (obviously)
</h4>

## Guide

如果你和我一样对所有React状态管理模式感到不爽，想更React，不折腾一些令人发狂的架构和方法论。

所以，你开始想：React组件的state API挺好的呀！容易理解，上手快：

```jsx
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

做为一个React新手你可能不能准确的知道所有细节，但你可以很快就弄明白大体功能是怎么回事。


唯一的问题是，我们不能方便的共享这个state。因为React组件被设计成为具有独立性。

如果我们能在多组件共享数据时使用React组件的state API就好啦！！

但是要怎么在多个组件之间共享数据呢？当然是用"context"啦！

> **Note:** 这是新的 `React.createContext` API 节选。
> [described in this RFC](https://github.com/reactjs/rfcs/blob/master/text/0002-new-version-of-context.md).

```jsx
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
  </AmountAdjuster>
);
```

这已经挺棒了。只要你对React思想稍微有点见解，就会明白这种写法语义明确可预测性强。

但我们现在要从这里出发，让事情更棒！

### Unstated 简介

以上就是Unstated怎么来的。

Unstated就是建立在React组件和context API之上的。

它有三部分:

##### `Container`

存放状态和逻辑的地方！

`Container` 是一个特别像`React.Component` 的类，但是只拥有state相关的部分: `this.state` 和
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

`Container` 还在幕后做一些发送事件，以使我们的APP可以监听更新的事情。执行 `setState` 会引发重新渲染。注意别直接更改this.state, 直接更改不会重新渲染。


###### `setState()`

`Container` 的 `setState()` 和React的`setState()`基本一样。

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

它也是异步的，你使用它时要遵守和React一样的约定。

**别设完state后立即从state里取值**

```js
class CounterContainer extends Container {
  state = { count: 0 };
  increment = () => {
    this.setState({ count: 1 });
    console.log(this.state.count); // 0
  };
}
```

**如果你在计算下一个state时用到前一个state,就用函数形式**

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

但是和React的`setState()`不一样的是， Unstated的`setState()`返回的是一个promise对象，所以你可以像下面这样使用`await`:

```js
class CounterContainer extends Container {
  state = { count: 0 };
  increment = async () => {
    await this.setState({ count: 1 });
    console.log(this.state.count); // 1
  };
}
```

Async 函数现在已经被[绝大多数现代浏览器](https://caniuse.com/#feat=async-functions)支持了，但是你也可以用[Babel](http://babeljs.io)将它解析成其它版本的JS以适配所有浏览器。

##### `<Subscribe>`

另一快儿，我们须要把我们的state插入组件树中，以完成三项功能：
* 当state改变时，重渲染我们的组件;
* 依赖container中的state;
* 调用container中的方法;

为此，Unstated提供 `<Subscribe>` 组件来让我们把container的类或实例传入组件树，而组件会接收到一个container实例。

```jsx
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

`<Subscribe>` 会自动构造container并监听其改变。

##### `<Provider>`

最后一块儿，我们须要一个地方在内部存贮所有container实例。所以我们提供了 `<Provider>`.

```jsx
render(
  <Provider>
    <Counter />
  </Provider>
);
```

我们可以用 `<Provider>` 做一些有趣的事情，像是依赖注入：

```jsx
let counter = new CounterContainer();

render(
  <Provider inject={[counter]}>
    <Counter />
  </Provider>
);
```

### Testing

当我们在考虑怎样组织项目的state的时候，必须要考虑测试。

我们希望确保状态容器保持"干净"。

现在，因为我们的container都是简单的类，我们可以在测试时构建实例，轻松的写不同功能的断言。

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

如果我们想测试container和组件结合的功能，我们可以构建container实例并注入组件中测试。

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

依赖注入在许多方面很有用。比如，如果我们可以很方便的从状态container中提取出方法来，

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

我们不须要做任何清理，因为一切都是后置的。


## FAQ

#### 我要把哪些state放入Unstated?

React社区聚焦于把所有状态放在同一个地方。你可以继续用Unstated这么做，我就不多说了。

我想说的是分散化的方案。

第一，尽量多的用组件state。上面的计数器其实根本不需要把state从组件中分离出来，不用Unstate也很好。

第二，用一些库把一些多次用到的相关的state抽离。

比如，表单让你很烦的话，你可能想用像[Final Form](https://github.com/final-form/react-final-form)这样的库.

如果请求特别多，可以试一下 [Apollo](https://www.apollographql.com)这个库，或者类似的，一些像[Backbone models and collections](http://backbonejs.org)这样的不这么酷但很稳定的库。
啥？你是不是太酷了，专用老的框架?

第三，很多多组件共享的状态可以定位到组件树中的一个分支上。

```jsx
<Tabs>
  <Tab>One</Tab>
  <Tab>Two</Tab>
  <Tab>Three</Tab>
</Tabs>
```
这种情况，我建议用React内置的 `React.createContext()` API,并且要小心的设计基础组件的API；

> **Note:** 如果你想在老版本的React中用新版React的context API，
> [点这里](https://github.com/thejameskyle/create-react-context/)

最后(当以上都干完时)，如果你真是需要一些全局的状态在整个项目中共享，你就可以用Unstated了。

我知道这些听起来可能很复杂，但这就是用正确的工具做正确的事的方式，真的不是整个宇宙都要用一套方法干活的。

Unstated没有什么野心，你只要在需要它的时候再使用它就好了，所以它很小很漂亮。不要把它当成Redux杀手。不要想着基于它创建复杂的工具，不要总想着造轮子。玩儿玩儿它，看看你会不会喜欢它！

#### 直接把自己的实例传入 `<Subscribe to>`

如果你不关心依赖注入只想把你自己的container实例直接传入 `<Subscribe>`，你可以：

<!-- prettier-ignore -->
```jsx
let counter = new CounterContainer();

function Counter() {
  return (
    <Subscribe to={[counter]}>
      {counter => <div>...</div>}
    </Subscribe>
  );
}
```

你要记住以下几点：
1. 当你放弃依赖注入的方式时，就不能在测试中用`<Provider inject>注入另一个实例了。
2. 你的实例会存在于所有你传入实例的`<Subscribe>`中，如果你不是传入同一个引用的话，最后你的container会有多个实例。

也请记住用 `<Provider inject>` 注入实例也是挺好的，你应该在应该传入实例。在大部分情况下这样更好，因为这样能不但能获得依赖注入还获得其它所有良好特性。

#### 怎样向container里传参?

一个好的方式是，像React组件一样在container类里添加一个构造函数接受一个 `props` 。然后自己实例化它，再把实例传入 `<Provider inject>`.

```jsx
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
  <Provider inject={[counter]}>
    <Counter />
  </Provider>
);
```

## Related

- [unstated-debug](https://github.com/sindresorhus/unstated-debug) - 方便的Debug你的Unstated container.
 
