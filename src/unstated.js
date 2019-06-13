// @flow
import React, { type Node } from 'react';
import createReactContext from 'create-react-context';

type Listener = () => mixed;

const StateContext = createReactContext(null);

export class Container<State: {}> {
  state: State;
  _listeners: Array<Listener> = [];

  constructor() {
    CONTAINER_DEBUG_CALLBACKS.forEach(cb => cb(this));
  }

  setState(
    updater: $Shape<State> | ((prevState: $Shape<State>) => $Shape<State>),
    callback?: () => void
  ): Promise<void> {
    return Promise.resolve().then(() => {
      let nextState;

      if (typeof updater === 'function') {
        nextState = updater(this.state);
      } else {
        nextState = updater;
      }

      if (nextState == null) {
        if (callback) callback();
        return;
      }

      this.state = Object.assign({}, this.state, nextState);

      let promises = this._listeners.map(listener => listener());

      return Promise.all(promises).then(() => {
        if (callback) {
          return callback();
        }
      });
    });
  }

  subscribe(fn: Listener) {
    this._listeners.push(fn);
  }

  unsubscribe(fn: Listener) {
    this._listeners = this._listeners.filter(f => f !== fn);
  }
}

export type ContainerType = Container<Object>;
export type ContainersType = Array<Class<ContainerType> | ContainerType>;
export type ContainerMapType = Map<Class<ContainerType>, ContainerType>;

export type SubscribeProps<Containers: ContainersType> = {
  to: Containers,
  children: (
    ...instances: $TupleMap<Containers, <C>(Class<C> | C) => C>
  ) => Node
};

type SubscribeUpdaterProps<Containers: ContainersType> = {
  instances: Array<ContainerType>,
  children: (
    ...instances: $TupleMap<Containers, <C>(Class<C> | C) => C>
  ) => Node
};
type SubscribeUpdaterState = {};

const DUMMY_STATE = {};

class SubscribeUpdater<Containers: ContainersType> extends React.Component<
  SubscribeUpdaterProps<Containers>,
  SubscribeUpdaterState
> {
  state = {};
  unmounted = false;

  componentDidMount() {
    this._subscribe(this.props.instances);
  }

  componentWillUnmount() {
    this.unmounted = true;
    this._unsubscribe(this.props.instances);
  }

  componentDidUpdate(prevProps: SubscribeUpdaterProps<Containers>) {
    this._unsubscribe(prevProps.instances);
    this._subscribe(this.props.instances);
  }

  _subscribe(instances: Array<ContainerType>) {
    instances.forEach(container => {
      container.unsubscribe(this.onUpdate);
      container.subscribe(this.onUpdate);
    });
  }

  _unsubscribe(instances: Array<ContainerType>) {
    instances.forEach(container => {
      container.unsubscribe(this.onUpdate);
    });
  }

  onUpdate: Listener = () => {
    return new Promise(resolve => {
      if (!this.unmounted) {
        this.setState(DUMMY_STATE, resolve);
      } else {
        resolve();
      }
    });
  };

  render() {
    return this.props.children.apply(null, this.props.instances);
  }
}

export class Subscribe<Containers: ContainersType> extends React.Component<
  SubscribeProps<Containers>
> {
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
    return containers.map(ContainerItem => {
      let instance;

      if (
        typeof ContainerItem === 'object' &&
        ContainerItem instanceof Container
      ) {
        instance = ContainerItem;
      } else {
        instance = safeMap.get(ContainerItem);

        if (!instance) {
          instance = new ContainerItem();
          safeMap.set(ContainerItem, instance);
        }
      }

      return instance;
    });
  }

  render() {
    return (
      <StateContext.Consumer>
        {map => (
          <SubscribeUpdater
            instances={this._createInstances(map, this.props.to)}
          >
            {this.props.children}
          </SubscribeUpdater>
        )}
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

let CONTAINER_DEBUG_CALLBACKS = [];

// If your name isn't Sindre, this is not for you.
// I might ruin your day suddenly if you depend on this without talking to me.
export function __SUPER_SECRET_CONTAINER_DEBUG_HOOK__(
  callback: (container: Container<any>) => mixed
) {
  CONTAINER_DEBUG_CALLBACKS.push(callback);
}
