// @flow
import React, { type Node } from 'react';
import createReactContext from 'create-react-context';

type Listener = () => mixed;

const StateContext = createReactContext(null);

export class Carrier<State: {}> {
  state: State;
  _listeners: Array<Listener> = [];

  constructor() {
    Carrier_DEBUG_CALLBACKS.forEach(cb => cb(this));
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

export type CarrierType = Carrier<Object>;
export type CarriersType = Array<Class<CarrierType> | CarrierType>;
export type CarrierMapType = Map<Class<CarrierType>, CarrierType>;

export type SubscribeProps<Carriers: CarriersType> = {
  to: Carriers,
  children: (
    ...instances: $TupleMap<Carriers, <C>(Class<C> | C) => C>
  ) => Node
};

type SubscribeState = {};

const DUMMY_STATE = {};

export class Subscribe<Carriers: CarriersType> extends React.Component<
  SubscribeProps<Carriers>,
  SubscribeState
> {
  state = {};
  instances: Array<CarrierType> = [];
  unmounted = false;

  componentWillUnmount() {
    this.unmounted = true;
    this._unsubscribe();
  }

  _unsubscribe() {
    this.instances.forEach(Carrier => {
      Carrier.unsubscribe(this.onUpdate);
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

  _createInstances(
    map: CarrierMapType | null,
    Carriers: CarriersType
  ): Array<CarrierType> {
    this._unsubscribe();

    if (map === null) {
      throw new Error(
        'You must wrap your <Subscribe> components with a <Provider>'
      );
    }

    let safeMap = map;
    let instances = Carriers.map(CarrierItem => {
      let instance;

      if (
        typeof CarrierItem === 'object' &&
        CarrierItem instanceof Carrier
      ) {
        instance = CarrierItem;
      } else {
        instance = safeMap.get(CarrierItem);

        if (!instance) {
          instance = new CarrierItem();
          safeMap.set(CarrierItem, instance);
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
  inject?: Array<CarrierType>,
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

let Carrier_DEBUG_CALLBACKS = [];

// If your name isn't Sindre, this is not for you.
// I might ruin your day suddenly if you depend on this without talking to me.
export function __SUPER_SECRET_Carrier_DEBUG_HOOK__(
  callback: (Carrier: Carrier<any>) => mixed
) {
  Carrier_DEBUG_CALLBACKS.push(callback);
}
