export type Result<T, E> = Ok<T, E> | Err<T, E>;

class Ok<T, E> {
  constructor(private value: T) {}
  map<R>(fn: (value: T) => R): Result<R, E> {
    return ok(fn(this.value))
  }
  map_or<R>(d: R, fn: (val: T) => R): Result<R, E> {
    return ok(fn(this.value))
  }
  or(d: Result<T, E>): Result<T, E> {
    return this
  }
  is_ok(): this is Ok<T, E> { return true }
  is_err(): this is Err<T, E> { return false }
  unwrap(): T {
    return this.value
  }
  unwrap_or_else<R>(d: (v: T) => R): R {
    return d(this.value)
  }
  static is<T, E>(o: Result<T, E>): o is Ok<T, E> {
    return o instanceof Ok
  }
}

export class Err<T, E> {
  constructor(private value: E) {}
  map<R>(fn: (value: E) => R): Result<R, E> {
    return ok(fn(this.value))
  }
  map_or<R>(d: R, fn: (val: T) => R): Result<R, E> {
    return ok(d)
  }
  or(d: Result<T, E>): Result<T, E> {
    return d
  }
  unwrap(): E {
    return this.value
  }
  unwrap_or_else<R>(d: (v: E) => R): R {
    return d(this.value)
  }
  is_ok(): this is Ok<T, E> { return false }
  is_err(): this is Err<T, E> { return true }
  static is<T, E>(o: Result<T, E>): o is Err<T, E> {
    return o instanceof Err
  }
}

export const ok = <T, E>(value: T): Result<T, E> => {
  return new Ok<T, E>(value);
}

export const err = <T, E>(value: E): Result<T, E> => {
  return new Err<T, E>(value)
}

export const isResult = (o: any): o is Result<any, any> => {
  return o instanceof Ok || o instanceof Err
}
