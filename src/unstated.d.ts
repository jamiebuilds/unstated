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
  new (...args: any[]): Container<State>;
}

type TupleMapToInstance<T> = {
  [K in keyof T]: T[K] extends { new (...args: any[]): infer Instance } ? Instance : never
};

export type ContainersType = [] | Array<ContainerType<object>>;

export interface SubscribeProps<Containers extends ContainersType> {
  to: Containers,
  children(...instances: TupleMapToInstance<Containers>): React.ReactNode;
}

export class Subscribe<Containers extends ContainersType>
  extends React.Component<SubscribeProps<Containers>> {}

export interface ProviderProps {
  inject?: Container<any>[];
  children: React.ReactNode;
}

export const Provider: React.SFC<ProviderProps>;
