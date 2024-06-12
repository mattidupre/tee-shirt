/* eslint-disable @typescript-eslint/ban-types */

import type {TupleValue, SliceTuple} from './tuple.js';

/**
 * @private
 */
type _IntegerTuple<
  TNumber extends number,
  TArray extends readonly number[] = [],
> = TArray['length'] extends TNumber
  ? TArray
  : _IntegerTuple<TNumber, [...TArray, TArray['length']]>;

/**
 * Constructs a union of integers beginning at the provided value,
 * up to and excluding the provided value.
 */
export type IntegerRange<
  TNumber1 extends number,
  TNumber2 extends number,
> = Exclude<
TupleValue<_IntegerTuple<TNumber2>>,
TupleValue<_IntegerTuple<TNumber1>>
>;

/**
 * Constructs a tuple of consecutive integers beginning at the provided value,
 * up to and excluding the provided value.
 */
export type IntegerRangeTuple<
  TNumber1 extends number,
  TNumber2 extends number,
> = SliceTuple<_IntegerTuple<TNumber2>, TNumber1, TNumber2>;

/**
 * Adds one integer to another integer.
 */
export type IntegerAdd<TNumber1 extends number, TNumber2 extends number> = [
  ..._IntegerTuple<TNumber1>,
  ..._IntegerTuple<TNumber2>,
]['length'] &
number;
