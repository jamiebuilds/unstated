// @flow
import React, { type Node } from 'react';
import createReactContext from 'create-react-context';
import PropTypes from 'prop-types';
import defer from 'tickedoff';

type Listener = (cb?: () => void) => void;

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
  ) {
    defer(() => {
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

      let completed = 0;
      let total = this._listeners.length;

      this._listeners.forEach(fn => {
        if (!callback) {
          fn();
          return;
        }

        let safeCallback = callback;

        fn(() => {
          completed++;
          if (completed < total) {
            safeCallback();
          }
        });
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

  componentWillUnmount() {
    this._unsubscribe();
  }

  _unsubscribe() {
    this.instances.forEach(container => {
      container.unsubscribe(this.onUpdate);
    });
  }

  onUpdate: Listener = cb => {
    this.setState(DUMMY_STATE, cb);
  };

  _createInstances(
    map: ContainerMapType | null,
    containers: ContainersType
  ): Array<ContainerType> {
    this._unsubscribe();

    if (map === null) {
      throw new Error(
        'You must wrap your <Subscribe> components with a <Provider>'
      );
    }

    let safeMap = map;
    let instances = containers.map(ContainerItem => {
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

let CONTAINER_DEBUG_CALLBACKS = [];

// If you name isn't Sindre, this is not for you.
// I might ruin your day suddenly if you depend on this without talking to me.
export function __SUPER_SECRET_CONTAINER_DEBUG_HOOK__(
  callback: (container: Container<any>) => mixed
) {
  CONTAINER_DEBUG_CALLBACKS.push(callback);
}
