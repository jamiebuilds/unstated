import * as React from 'react';

export class Container<State extends object> {
  state: State;
  setState(state: Partial<State>): void;
  subscribe(fn: Function): void;
  unsubscribe(fn: Function): void;
}

export interface ContainerType<State extends object> {
  new (): Container<State>;
}

interface SubscribeProps {
  to: ContainerType<any>[];
  children(...instances: Container<any>[]): React.ReactNode;
}

export class Subscribe extends React.Component<SubscribeProps> {}

export interface ProviderProps {
  inject?: Container<any>[];
  children: React.ReactNode;
}

export const Provider: React.SFC<ProviderProps>;
