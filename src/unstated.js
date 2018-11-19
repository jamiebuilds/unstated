// @flow
import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  type Node
} from 'react';

type Listener = () => mixed;

const StateContext = createContext(null);

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

type SubscribeState = {};

const DUMMY_STATE = {};
export type ProviderProps = {
  inject?: Array<ContainerType>,
  children: Node
};

export function Provider({ inject, children }: ProviderProps) {
  const parentMap = useContext(StateContext);
  const childMap = useRef(new Map(parentMap));
  useEffect(() => {
    if (!inject) return;
    inject.forEach(instance => {
      childMap.current.set(instance.constructor, instance);
    });
  }, []);

  return (
    <StateContext.Provider value={childMap.current}>
      {children}
    </StateContext.Provider>
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

/**
 * Subscribe using new Hook api
 */
export function useUnstated(...containers: ContainersType) {
  const map: ContainerMapType | null = useContext(StateContext);
  if (map === null) {
    throw new Error('You must wrap your hook component with a <Provider>');
  }

  const [state, setState] = useState({});
  const instances = useRef([]);
  const unmounted = useRef(false);

  useEffect(
    () => () => {
      unmounted.current = true;
      unsubscribe();
    },
    []
  );

  const onUpdate = useRef(
    () =>
      new Promise(resolve => {
        if (!unmounted.current) setState(DUMMY_STATE, resolve);
        else resolve();
      })
  );

  function unsubscribe() {
    instances.current.forEach(container => {
      container.unsubscribe(onUpdate.current);
    });
  }

  function createInstances() {
    let safeMap = map;
    unsubscribe();

    const newInstances = containers.map(ContainerItem => {
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

      instance.unsubscribe(onUpdate.current);
      instance.subscribe(onUpdate.current);

      return instance;
    });

    instances.current = newInstances;
    return instances.current;
  }

  return useMemo(() => createInstances(), containers);
}

export function Subscribe<Containers: ContainersType>(
  props: SubscribeProps<Containers>
) {
  const { to, children } = props;
  const instances = useUnstated(...to);

  return children(...instances);
}
