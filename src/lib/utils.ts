import type {Add, Compare, IsInt} from 'ts-arithmetic';

/**
 * Flattens type into a format readable by the IDE.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type Simplify<T> = {[KeyType in keyof T]: T[KeyType]} & {};

/**
 * @private
 */
type _IsValidRange<TStart extends number, TEnd extends number> =
  IsInt<TStart> extends 1
    ? IsInt<TEnd> extends 1
      ? [TStart] extends [TEnd]
        ? 1
        : Compare<TStart, TEnd> extends -1
          ? 1
          : 0
      : 0
    : 0;

/**
 * @private
 */
type _IntegerRange<
  TStart extends number,
  TEnd extends number,
  TResult extends number = never,
> = TEnd extends TStart
  ? TResult | TStart
  : _IntegerRange<Add<TStart, 1>, TEnd, TResult | TStart>;

/**
 * Constructs a union of integers beginning at the provided value,
 * up to and including the provided value.
 */
export type IntegerRange<TStart extends number, TEnd extends number> =
  _IsValidRange<TStart, TEnd> extends 1 ? _IntegerRange<TStart, TEnd> : never;

/**
 * @private
 */
type _IntegerRangeTuple<
  TStart extends number,
  TEnd extends number,
  TArray extends undefined | readonly number[] = undefined,
> = TArray extends readonly number[]
  ? TEnd extends TStart
    ? [...TArray, TStart]
    : _IntegerRangeTuple<Add<TStart, 1>, TEnd, [...TArray, TStart]>
  : _IntegerRangeTuple<TStart, TEnd, []>;

/**
 * Constructs a tuple of consecutive integers beginning at the provided value,
 * up to and including the provided value.
 */
export type IntegerRangeTuple<TStart extends number, TEnd extends number> =
  _IsValidRange<TStart, TEnd> extends 1
    ? _IntegerRangeTuple<TStart, TEnd>
    : never;

/**
 * Constructs an array of mapped values from integers within the provided range.
 */
export const mapIntegerRange = <T>(
  start: number,
  end: number,
  callback: (number: number) => T,
): readonly T[] => {
  const result: T[] = [];
  for (let i = start; i <= end; i += 1) {
    result.push(callback(i));
  }

  return result;
};

export const lazy = function <T extends PropertyDescriptor>(
  _: unknown,
  __: unknown,
  descriptor: T,
) {
  const initialValue = Symbol('initial-value');
  let memoizedValue: unknown = initialValue;
  const {get} = descriptor;
  if (get) {
    descriptor.get = function () {
      if (memoizedValue === initialValue) {
        memoizedValue = get.apply(this);
      }

      return memoizedValue;
    };
  }
};

export const mapArrayToObject = <
  TArray extends readonly PropertyKey[],
  TCallback extends (value: TArray[number], index: number) => unknown,
>(
  array: TArray,
  callback: TCallback,
) => {
  const result = {} as Record<TArray[number], ReturnType<TCallback>>;
  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < array.length; i += 1) {
    const key = array[i];
    (result as Record<PropertyKey, unknown>)[key] = callback(key, i);
  }

  return result;
};

/**
 * Trim all line breaks, tabs, and double spaces.
 */
export const trimInside = (string: string) =>
  // eslint-disable-next-line unicorn/prefer-string-replace-all
  string.replace(/\s+/g, ' ').trim();
