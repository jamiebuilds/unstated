import * as React from 'react';

export class Container<State extends object> {
  state: State;
  setState<K extends keyof State>(
    state:
      | ((prevState: Readonly<State>) => Pick<State, K> | State | null)
      | (Pick<State, K> | State | null),
    callback?: () => void
  ): Promise<void>;
  subscribe(fn: () => any): void;
  unsubscribe(fn: () => any): void;
}

export interface ContainerType<State extends object> {
  new(...args: any[]): Container<State>;
}

export interface ProviderProps {
  inject?: [...Array<Container<any>>];
  children: React.ReactNode;
}

export const Provider: React.SFC<ProviderProps>;

type InjectableMap<T extends [...Array<Container<any>>]> = {
  [K in keyof T]: T[K] | { new(): T[K] };
};

export function useUnstated<T extends [...Array<Container<any>>]>(...containers: InjectableMap<T>): T;

interface SubscribeProps<T extends [...Array<Container<any>>]> {
  to: InjectableMap<T>;
  children(...instances: T): React.ReactNode;
}

export class Subscribe<T extends [...Array<Container<any>>]> extends React.Component<SubscribeProps<T>> { }
