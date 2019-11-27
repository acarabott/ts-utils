export type EventAction<T> = (current: T, previous?: T) => void;

export type Subscription<E, T> = [Events<E>, E, EventAction<T>];

export class Events<T_Event> {
  protected events: Map<T_Event, Set<EventAction<any>>>;
  protected cachedArgs: Map<T_Event, any>;

  constructor() {
    this.events = new Map();
    this.cachedArgs = new Map();
  }

  public subscribe<T>(
    key: T_Event,
    action: EventAction<T>,
    trigger: boolean,
  ): Subscription<T_Event, T> {
    if (!this.events.has(key)) {
      this.events.set(key, new Set());
    }
    const actions = this.events.get(key)!;
    actions.add(action);
    if (this.cachedArgs.has(key) && trigger) {
      action(this.cachedArgs.get(key));
    }

    return [this, key, action];
  }

  public unsubscribe<T>(key: T_Event, action: EventAction<T>) {
    const actions = this.events.get(key);
    if (actions === undefined) {
      return;
    }
    actions.delete(action);
  }

  public notify<T>(key: T_Event, value?: T) {
    const prev = this.cachedArgs.get(key);
    this.cachedArgs.set(key, value);
    const event = this.events.get(key);
    if (event === undefined) {
      return;
    }
    for (const action of event) {
      action(value, prev);
    }
  }
}
