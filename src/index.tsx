import React  from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'

type Listener = () => Promise<void>

export class Container<S extends object> {
  state: S
  _listeners: Listener[] = []

  constructor() {
    CONTAINER_DEBUG_CALLBACKS.forEach(cb => cb(this))
  }

  setState(
    updater?: Partial<S> | ((prevState: S) => Partial<S>),
    callback?: (state?: S) => void
  ): Promise<void> {
    let nextState: Partial<S>
    if (typeof updater === 'function') {
      nextState = (updater as (prevState: S) => Partial<S>)(this.state)
    } else {
      nextState = updater
    }

    if (nextState === null) {
      if (callback) callback(this.state)
      return Promise.resolve()
    }

    if (nextState && nextState !== this.state) {
      this.state = {...this.state, ...nextState}
    }
    
    let promises = this._listeners.map(listener => listener())
    return Promise.all(promises).then(() => {
      if (callback && typeof callback === 'function') {
        callback(this.state)
      }
    })
  }

  subscribe(fn: Listener) {
    this._listeners.push(fn);
  }

  unsubscribe(fn: Listener) {
    this._listeners = this._listeners.filter(f => f !== fn);
  }
}

interface ContainerClass<S extends object, TContainer extends Container<S> = Container<S>> {
  new (...args: any[]): TContainer
}

type ContainerType<S extends object> = Container<S> | ContainerClass<S>

type ContainersType = [ContainerType<object>, ...ContainerType<object>[]]

type ContainersMap = Map<ContainerClass<object>, Container<object>>

type MapContainersType<TContainers extends ContainersType> = {
  [K in keyof TContainers]: TContainers[K] extends ContainerClass<object, infer C> ? C : 
    TContainers[K] extends Container<object> ? TContainers[K] : any
}

type Containers<
  TContainers extends ContainerType<object> | ContainersType
> = TContainers extends ContainerClass<object, infer C> ? [C] : 
    TContainers extends Container<object> ? [TContainers] :
    TContainers extends ContainersType ? MapContainersType<TContainers> :
    any[]

export interface ISubscribeProps<TContainers extends ContainersType> {
  to: TContainers
  children: (...instances: Containers<TContainers>) => React.ReactNode
}

const Context = React.createContext<ContainersMap>(null)  // type ContainersMap

export class Subscribe<TContainers extends ContainersType> extends React.Component<ISubscribeProps<TContainers>> {
  state = {}
  _instances = []
  _unmounted = false

  _unsubscribe() {
    this._instances.forEach(container => {
      container.unsubscribe(this.onUpdate)
    })
  }

  _createInstances(
    ctx: ContainersMap,
    containers: TContainers
  ) {
    this._unsubscribe()

    if (!ctx) {
      throw new Error(
        'You must wrap your <Subscribe> components with a <Provider>'
      )
    }

    this._instances = containers.map(item => {
      let instance: ContainerType<object>
      if (typeof item === 'object' && item instanceof Container) {
        instance = item
      } else {
        instance = ctx.get(item)
        if (!instance) {
          instance = new item()
          ctx.set(item, instance)
        }
        instance.subscribe(this.onUpdate)
      }

      return instance
    })

    return this._instances as Containers<TContainers>
  }

  componentWillUnmount() {
    this._unmounted = true
    this._unsubscribe()
  }

  onUpdate: Listener = async () => {
    return new Promise(resolve => {
      if (!this._unmounted) {
        this.setState({}, resolve)
      } else {
        resolve()
      }
    })
  }

  render() {
    const { to, children } = this.props
    return (
      <Context.Consumer>
        {ctx => children.apply(null, this._createInstances(ctx, to))}
      </Context.Consumer>
    )
  }
}

interface IProviderProps {
  inject?: [Container<object>, ...Container<object>[]]
  children: React.ReactNode
}

export const Provider = ({inject, children}: IProviderProps) => {
  return (
    <Context.Consumer>
      {ctx => {
        let map = new Map(ctx)
  
        if (inject) {
          inject.forEach(instance => {
            map.set(instance.constructor as any, instance)
          })
        }
  
        return (
          <Context.Provider value={map}>
            {children}
          </Context.Provider>
        )
      }}
    </Context.Consumer>
  )
}

type IMapStateToProps<
  TContainers extends ContainerType<object> | ContainersType
> = (...containers: Containers<TContainers>) => object

export const unstated = <
  TContainers extends ContainerType<object> | ContainersType
>(containers: TContainers, mapStateToProps?: IMapStateToProps<TContainers>) => 
  <P extends object>(Component: React.ComponentType<P>) => {
    class UnstatedComponent extends React.Component<P> {
      render() {
        return (
          <Subscribe to={(Array.isArray(containers) ? containers: [containers]) as ContainersType}>{
            (...containers) => {
              let injectProps = {}
              if (mapStateToProps === undefined) {
                containers.forEach(c => {
                  let container = c.constructor.name
                  container = container.charAt(0).toLowerCase() + container.slice(1)

                  injectProps = {
                    ...injectProps,
                    [container]: c
                  }
                })
              } else {
                injectProps = mapStateToProps(...containers as any)
              }
              return <Component {...this.props} {...injectProps}/>
            }
          }</Subscribe>
        )
      }
    }

  // display name
  (UnstatedComponent as React.ComponentType).displayName =
    `Unstated(${Component.displayName || Component.name || 'Component'})`

  // Copy statics
  hoistNonReactStatic(UnstatedComponent, Component)

  return UnstatedComponent as React.ComponentType<any>
}

export default unstated

/* FOR DEBUG START */
type ContainerDebugCallback = (container: Container<object>) => void

let CONTAINER_DEBUG_CALLBACKS: ContainerDebugCallback[] = []

// If your name isn't Sindre, this is not for you.
// I might ruin your day suddenly if you depend on this without talking to me.
export function __SUPER_SECRET_CONTAINER_DEBUG_HOOK__(
  callback: ContainerDebugCallback
) {
  CONTAINER_DEBUG_CALLBACKS.push(callback)
}
/* FOR DEBUG END */
