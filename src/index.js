// @flow
import React, { type Node } from 'react';
import createReactContext from 'create-react-context';

const StateContext = createReactContext();

export class Container<State: {}> {
  state: State;
  _listeners: Array<Function>;

  constructor() {
    this._listeners = [];
  }

  setState(state: $Shape<State>) {
    this.state = Object.assign({}, this.state, state);
    this._listeners.forEach(fn => fn());
  }

  _subscribe(fn: Function) {
    this._listeners.push(fn);
  }

  _unsubscribe(fn: Function) {
    this._listeners = this._listeners.filter(f => f !== fn);
  }
}

export type SubscribeProps = {
  to: Array<any>,
  children: (...containers: Array<any>) => Node
};

export class Subscribe extends React.Component<SubscribeProps> {
  componentDidMount() {
    // ...
  }

  componentWillReceiveProps() {
    // ...
  }

  componentWillUnmount() {
    // ...
  }

  onUpdate = () => {
    // ...
  };

  _createInstances(map: Map<any, any>, containers: Array<any>) {
    return containers.map(Container => {
      let container = map.get(Container);
      if (!container) {
        container = new Container();
        map.set(Container, container);
      }
      return container;
    });
  }

  render() {
    return (
      <StateContext.Consumer>
        {parentMap => {
          let childMap = new Map(parentMap);
          return (
            <StateContext.Provider value={childMap}>
              {this.props.children.apply(
                null,
                this._createInstances(childMap, this.props.to)
              )}
            </StateContext.Provider>
          );
        }}
      </StateContext.Consumer>
    );
  }
}

export type ProvideProps = {
  inject: Array<any>,
  children: Node
};

export class Provide extends React.Component<ProvideProps> {
  render() {
    let map = new Map();

    this.props.inject.forEach(instance => {
      map.set(instance.constructor, instance);
    });

    return (
      <StateContext.Provider value={map}>
        {this.props.children}
      </StateContext.Provider>
    );
  }
}
