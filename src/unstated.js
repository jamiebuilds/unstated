// @flow
import React, { type Node } from 'react';
import createReactContext from 'create-react-context';
import PropTypes from 'prop-types';

const StateContext = createReactContext(new Map([]));

export class Container<State: {}> {
  state: State;
  _listeners: Array<() => mixed>;

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

export type ContainerType = Container<Object>;
export type ContainersType = Array<Class<ContainerType>>;
export type ContainerMapType = Map<Class<ContainerType>, ContainerType>;

export type SubscribeProps<Containers: ContainersType> = {
  to: Containers,
  children: (...instances: $TupleMap<Containers, <C>(Class<C>) => C>) => Node
};

type SubscribeState = {};

const DUMMY_STATE = {};

export class Subscribe<Containers: ContainersType> extends React.Component<
  SubscribeProps<Containers>,
  SubscribeState
> {
  static propTypes = {
    to: PropTypes.array.isRequired,
    children: PropTypes.func.isRequired
  };

  state = {};
  _map: ContainerMapType = new Map();
  _instances: Array<ContainerType> = [];

  componentWillReceiveProps() {
    this._unsubscribe();
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  _unsubscribe() {
    this._instances.forEach(container => {
      container._unsubscribe(this.onUpdate);
    });
  }

  onUpdate = () => {
    this.setState(DUMMY_STATE);
  };

  _createInstances(
    parentMap: ContainerMapType,
    containers: ContainersType
  ): Array<ContainerType> {
    this._instances = containers.map(Container => {
      let container = parentMap.get(Container) || this._map.get(Container);

      if (!container) {
        container = new Container();
        this._map.set(Container, container);
      }

      return container;
    });

    this._instances.forEach(instance => {
      instance._subscribe(this.onUpdate);
    });

    return this._instances;
  }

  render() {
    return (
      <StateContext.Consumer>
        {parentMap => {
          let instances = this._createInstances(parentMap, this.props.to);
          let childMap = new Map();

          for (let [key, val] of parentMap) childMap.set(key, val);
          for (let [key, val] of this._map) childMap.set(key, val);

          return (
            <StateContext.Provider value={childMap}>
              {this.props.children.apply(null, instances)}
            </StateContext.Provider>
          );
        }}
      </StateContext.Consumer>
    );
  }
}

export type ProvideProps = {
  inject: Array<ContainerType>,
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
