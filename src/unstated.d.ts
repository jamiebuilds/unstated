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

interface SubscribeProps1<T extends ContainerType<any>> {
  to: [T];
  children(input: InstanceType<T>): React.ReactNode
}
interface SubscribeProps2<T extends ContainerType<any>, U extends ContainerType<any>> {
  to: [T,U];
  children(input: InstanceType<T>, input2: InstanceType<U>): React.ReactNode
}
interface SubscribeProps3<T extends ContainerType<any>, U extends ContainerType<any>, V extends ContainerType<any>> {
  to: [T,U,V];
  children(input: InstanceType<T>, input2: InstanceType<U>, input3: InstanceType<V>): React.ReactNode
}
interface SubscribeProps4<T extends ContainerType<any>, U extends ContainerType<any>, V extends ContainerType<any>, W extends ContainerType<any>> {
  to: [T,U,V,W];
  children(input: InstanceType<T>, input2: InstanceType<U>, input3: InstanceType<V>, input4: InstanceType<W>): React.ReactNode
}
interface SubscribeProps5<T extends ContainerType<any>, U extends ContainerType<any>, V extends ContainerType<any>, W extends ContainerType<any>, X extends ContainerType<any>> {
  to: [T,U,V,W, X];
  children(input: InstanceType<T>, input2: InstanceType<U>, input3: InstanceType<V>, input4: InstanceType<W>, input5: InstanceType<X>): React.ReactNode
}

interface SubscribeProps {
  to: (ContainerType<any> | Container<any>)[];
  children(...instances: Container<any>[]): React.ReactNode;
}

export function Subscribe<T extends ContainerType<any>>(props: SubscribeProps1<T>): React.ReactNode;
export function Subscribe<T extends ContainerType<any>, U extends ContainerType<any>>(props: SubscribeProps2<T, U>): React.ReactNode;
export function Subscribe<T extends ContainerType<any>, U extends ContainerType<any>, V extends ContainerType<any>>(props: SubscribeProps3<T, U,V>): React.ReactNode;
export function Subscribe<T extends ContainerType<any>, U extends ContainerType<any>, V extends ContainerType<any>, W extends ContainerType<any>>(props: SubscribeProps4<T, U,V, W>): React.ReactNode;
export function Subscribe<T extends ContainerType<any>, U extends ContainerType<any>, V extends ContainerType<any>, W extends ContainerType<any>, X extends ContainerType<any>>(props: SubscribeProps5<T, U,V, W, X>): React.ReactNode;
export function Subscribe(props: SubscribeProps): React.ReactNode;

export interface ProviderProps {
  inject?: Container<any>[];
  children: React.ReactNode;
}

export const Provider: React.SFC<ProviderProps>;
