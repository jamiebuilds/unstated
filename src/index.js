// @flow
import React, { type Node } from 'react';
import createReactContext from 'create-react-context';
import PropTypes from 'prop-types';

const StateContext = createReactContext(null);

export class Container<State: {}> {
  state: State;
  _listeners: Array<() => mixed>;

  constructor() {
    this._listeners = [];
  }

  setState(state: $Shape<State>) {
    debugger;
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

export type SubscribeProps<Containers: ContainersType> = {
  to: Containers,
  children: (...instances: $TupleMap<Containers, <C>(Class<C>) => C>) => Node
};

const DUMMY_STATE = {};

export class Subscribe<Containers: ContainersType> extends React.Component<
  SubscribeProps<Containers>
> {
  static propTypes = {
    to: PropTypes.array.isRequired,
    children: PropTypes.func.isRequired
  };

  state = {};
  _instances: Array<ContainerType> = [];

  componentWillReceiveProps() {
    this._unsubscribe();
  }

  componentWillUnmount() {
    this._unsubscribe(this.props.to);
  }

  _unsubscribe(containers: Array<ContainerType>) {
    this._instances.forEach(container => {
      container._unsubscribe(this.onUpdate);
    });
  }

  onUpdate = () => {
    this.setState(DUMMY_STATE);
  };

  _createInstances(
    map: Map<Class<ContainerType>, ContainerType>,
    containers: Array<Class<ContainerType>>
  ): Array<ContainerType> {
    this._instances = containers.map(Container => {
      let container = map.get(Container);
      if (!container) {
        container = new Container();
        map.set(Container, container);
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
          let childMap = new Map(parentMap);
          let instances = this._createInstances(childMap, this.props.to);
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
