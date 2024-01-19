
export abstract class Option<T> {
  abstract map<R>(fn: (val: T) => R): Option<R>
  abstract map_or<R>(d: R, fn: (val: T) => R): R
  abstract filter(fn: (val: T) => boolean): Option<T>
  abstract or(d: Option<T>): Option<T>
  abstract unwrap(): T
  abstract unwrap_or_else(d: () => T): T
  abstract is_some(): this is Some<T>
  abstract is_none(): this is None<T>
  abstract iter(): T[]
  abstract equal(other: Option<T>): boolean
  static from<T>(obj: T | undefined | null): Option<T> {
    if (obj === undefined || obj === null)
      return none()
    return some(obj)
  }
}

class Some<T> implements Option<T> {
  constructor(private value: T) {}
  map<R>(fn: (value: T) => R): Option<R> {
    return some(fn(this.value))
  }
  map_or<R>(d: R, fn: (val: T) => R): R {
    return fn(this.value)
  }
  filter(fn: (m: T) => boolean): Option<T> {
    if (fn(this.value)) return some(this.value)
    return none()
  }
  or(d: Option<T>): Option<T> {
    return this
  }
  iter(): T[] {
    return [this.value]
  }
  unwrap(): T {
    return this.value
  }
  unwrap_or_else(d: () => T): T {
    return this.unwrap()
  }
  is_some(): this is Some<T> {
    return true
  }
  is_none(): this is None<T> {
    return false
  }
  equal(other: Option<T>): boolean {
    if (other.is_some())
      return this.value === other.value
    return false
  }
  static is<T>(o: Option<T>): o is Some<T> {
    return o instanceof Some
  }
}

class None<T> implements Option<T> {
  map<R>(fn: (value: T) => R): Option<R> {
    return none()
  }
  map_or<R>(d: R, fn: (val: T) => R): R {
    return d
  }
  filter(fn: (m: T) => boolean): Option<T> {
    return none()
  }
  or(d: Option<T>): Option<T> {
    return d
  }
  iter(): T[] {
    return []
  }
  unwrap(): T {
    throw new Error("Unwrapped None")
  }
  unwrap_or_else(d: () => T): T {
    return d()
  }
  is_some(): this is Some<T> {
    return false
  }
  is_none(): this is None<T> {
    return true
  }
  equal(other: Option<T>): boolean {
    return other.is_none()
  }
  static is<T>(o: Option<T>): o is None<T> {
    return o instanceof None
  }
}

export const some = <T>(value: T): Option<T> => {
  return new Some<T>(value);
}

export const none = <T>(): Option<T> => {
  return new None()
}

export const isOption = <T>(o: any): o is Option<T> => {
  return o instanceof Some || o instanceof None
}
