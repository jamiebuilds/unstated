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

interface SubscribeProps {
  to: (ContainerType<any> | Container<any>)[];
  children(...instances: Container<any>[]): React.ReactNode;
}

export class Subscribe extends React.Component<SubscribeProps> { }

export interface ProviderProps {
  inject?: Container<any>[];
  children: React.ReactNode;
}

export const Provider: React.SFC<ProviderProps>;

export function useUnstated(...containers: (ContainerType<any> | Container<any>)[]): Container<any>[];
