import { Option } from '../data/Option';

export { binary_search_by_key } from './binary_search_by_key'

export function range(start: number, end: number) {
  let rv = [];
  while (start < end) {
    rv.push(start);
    start++;
  }
  return rv;
}

export function *rangeIter(start: number, end: number) {
  while (start < end) {
    yield start
    start++
  }
  return
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function wrapping_add_usize(lhs: number, rhs: number): number {
  // NOTE: this seems to work but is definitely wrong
  return (lhs + rhs)
}

export const max = (self: number[]) => {
  if (self.length === 0) return undefined
  return Math.max.apply(null, self);
};

export const min = (self: number[]) => {
  if (self.length === 0) return undefined
  return Math.min.apply(null, self);
};

// convert a boolean to an integer value
export const bton = (b: boolean): number => b === true ? 1 : 0

export function sort_by_key<T>(arr: T[], fn: (a: T) => number | string): void {
  arr.sort((a, b) => {
    return (fn(a) as any) - (fn(b) as any)
  })
}

export function min_by_key<T>(arr: T[], fn: (value: T) => number): Option<T> {
  let res: [number, T | null] = [Infinity, null]
  for (let val of arr) {
    if (fn(val) < res[0]) {
      res = [fn(val), val]
    }
  }
  return Option.from(res[1])
}

export const isString = (o: any): o is string => typeof o === "string"
export const isNumber = (o: any): o is number => typeof o === "number"
export const isBoolean = (o: any): o is boolean => typeof o === "boolean"

export const isCallback = (
  maybeFunction: true | ((...args: any[]) => void),
): maybeFunction is (...args: any[]) => void =>
  typeof maybeFunction === 'function'

export function toCamelCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}
