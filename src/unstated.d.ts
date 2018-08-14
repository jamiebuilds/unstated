import * as React from 'react';

export class Carrier<State extends object> {
  state: State;
  setState<K extends keyof State>(
    state:
      | ((prevState: Readonly<State>) => Partial<State> | State | null)
      | (Partial<State> | State | null),
    callback?: () => void
  ): Promise<void>;
  subscribe(fn: () => any): void;
  unsubscribe(fn: () => any): void;
}

export interface CarrierType<State extends object> {
  new (...args: any[]): Carrier<State>;
}

interface SubscribeProps {
  to: (CarrierType<any> | Carrier<any>)[];
  children(...instances: Carrier<any>[]): React.ReactNode;
}

export class Subscribe extends React.Component<SubscribeProps> {}

export interface ProviderProps {
  inject?: Carrier<any>[];
  children: React.ReactNode;
}

export const Provider: React.SFC<ProviderProps>;
