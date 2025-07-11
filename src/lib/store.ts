export class Store<T> {
  subscribers: ((value: T) => void)[] = [];

  constructor(initialState: T) {
    this.state = initialState;
  }

  private _state: T;

  get state() {
    return this._state;
  }

  set state(value: T) {
    if (Store.shallowEqual(this._state, value)) return;
    this._state = value;
    this.subscribers.forEach((subscriber) => subscriber(this._state));
  }

  setState(partial: Partial<T>) {
    if (typeof this._state !== "object" || typeof partial !== "object") {
      this.state = partial as T;
      return;
    }

    const partialKeys = Object.keys(partial);
    const isEqual = partialKeys.every((p) => {
      return this._state[p] === partial[p];
    });
    if (isEqual) return;

    this._state = { ...this._state, ...partial };
    this.subscribers.forEach((subscriber) => subscriber(this._state));
  }

  subscribe(subscriber: (value: T) => void) {
    this.subscribers.push(subscriber);
  }

  static shallowEqual(obj1: any, obj2: any) {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every((key) => obj1[key] === obj2[key]);
  }
}
