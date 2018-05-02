import * as React from 'react';

export class Container<State extends object> {
  state: State;
  setState<K extends keyof State>(
    state: ((prevState: Readonly<State>) => (Partial<State> | State | null)) | (Partial<State> | State | null),
    callback?: () => void
  ): void;
  subscribe(fn: Function): void;
  unsubscribe(fn: Function): void;
}

export interface ContainerType<State extends object> {
  new (...args: any[]): Container<State>;
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
