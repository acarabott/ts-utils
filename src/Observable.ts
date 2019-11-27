export type ObsAction<T> = (current: T, previous?: T) => void;

export class Observable<E> {
  protected events: Map<E, Set<ObsAction<any>>>;
  protected cachedArgs: Map<E, any>;

  constructor() {
    this.events = new Map();
    this.cachedArgs = new Map();
  }

  public subscribe<T>(key: E, action: ObsAction<T>, trigger= true) {
    this.addAction(key, action);
    if (this.hasArgs(key) && trigger) { action(this.getArgs(key)); }
  }

  public unsubscribe<T>(key: E, action: ObsAction<T>) {
    this.removeAction(key, action);
  }

  public notify<T>(key: E, value?: T) {
    const event = this.getEvent(key);
    if (event === undefined) { return; }
    event.forEach(action => action(value, this.getArgs(key)));
    this.setArgs(key, value);
  }

  // Bizniz
  protected hasEvent(key: E) {
    return this.events.has(key);
  }

  protected getEvent(key: E) {
    return this.events.get(key);
  }

  protected hasArgs(key: E) {
    return this.cachedArgs.has(key);
  }

  protected getArgs(key: E) {
    return this.cachedArgs.get(key);
  }

  protected setArgs(key: E, value: any) {
    this.cachedArgs.set(key, value);
  }

  protected removeAction(key: E, action: ObsAction<any>) {
    const actions = this.events.get(key);
    if (actions === undefined) { return; }
    actions.delete(action);
  }

  protected addAction(key: E, action: ObsAction<any>) {
    if (!this.hasEvent(key)) { this.events.set(key, new Set()); }
    const actions = this.events.get(key)!;
    actions.add(action);
  }
}
