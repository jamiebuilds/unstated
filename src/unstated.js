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

  setState(state: $Shape<State>, force?: Boolean) {
    this.state = force ? state : Object.assign({}, this.state, state);
    this._listeners.forEach(fn => fn());
  }

  subscribe(fn: Function) {
    this._listeners.push(fn);
  }

  unsubscribe(fn: Function) {
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
  instances: Array<ContainerType> = [];

  componentWillReceiveProps() {
    this._unsubscribe();
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  _unsubscribe() {
    this.instances.forEach(container => {
      container.unsubscribe(this.onUpdate);
    });
  }

  onUpdate = () => {
    this.setState(DUMMY_STATE);
  };

  _createInstances(
    map: ContainerMapType | null,
    containers: ContainersType
  ): Array<ContainerType> {
    if (map === null) {
      throw new Error(
        'You must wrap your <Subscribe> components with a <Provider>'
      );
    }

    let safeMap = map;
    let instances = containers.map(Container => {
      let instance = safeMap.get(Container);

      if (!instance) {
        instance = new Container();
        safeMap.set(Container, instance);
      }

      instance.unsubscribe(this.onUpdate);
      instance.subscribe(this.onUpdate);

      return instance;
    });

    this.instances = instances;
    return instances;
  }

  render() {
    return (
      <StateContext.Consumer>
        {map =>
          this.props.children.apply(
            null,
            this._createInstances(map, this.props.to)
          )
        }
      </StateContext.Consumer>
    );
  }
}

export type ProviderProps = {
  inject?: Array<ContainerType>,
  children: Node
};

export function Provider(props: ProviderProps) {
  return (
    <StateContext.Consumer>
      {parentMap => {
        let childMap = new Map(parentMap);

        if (props.inject) {
          props.inject.forEach(instance => {
            childMap.set(instance.constructor, instance);
          });
        }

        return (
          <StateContext.Provider value={childMap}>
            {props.children}
          </StateContext.Provider>
        );
      }}
    </StateContext.Consumer>
  );
}
