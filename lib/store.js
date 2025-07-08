/**
 * @template T
 */
export class Store {
  /**
   * @type {((value: T) => void)[]}
   */
  subscribers = [];

  /** @param {T} initialState */
  constructor(initialState = {}) {
    this.state = initialState;
  }

  /** @type {T} */
  #state = {};

  get state() {
    return this.#state;
  }

  /** @param {T} value */
  set state(value) {
    if (this.constructor.shallowEqual(this.#state, value)) return;
    this.#state = value;
    this.subscribers.forEach((subscriber) => subscriber(this.#state));
  }

  /** @param {Partial<T>} partial */
  setState(partial) {
    if (typeof this.#state !== "object" || typeof partial !== "object") {
      this.state = partial;
      return;
    }

    const partialKeys = Object.keys(partial);
    const isEqual = partialKeys.every((p) => {
      return this.#state[p] === partial[p];
    });
    if (isEqual) return;

    this.#state = { ...this.#state, ...partial };
    this.subscribers.forEach((subscriber) => subscriber(this.#state));
  }

  /** @param {(value: T) => void} subscriber */
  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  static shallowEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every((key) => obj1[key] === obj2[key]);
  }
}
