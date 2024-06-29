import type {
  Negate,
  Add,
  Subtract,
  IsPositive,
  IsNegative,
  Gt,
} from 'ts-arithmetic';
import {
  mapIntegerRange,
  type IntegerRange,
  type IntegerRangeTuple,
  type Simplify,
} from './utils.js';

/**
 * The start or end value of {@link TshirtBounds}.
 * @private
 */
type _Bound = TshirtSize | number;

/**
 * Fixed type for Tshirt bounds configuration in format
 * [start: number | TshirtSize, end: number | TshirtSize] or [...TshirtSize].
 */
export type TshirtBounds = readonly TshirtSize[] | readonly [_Bound, _Bound];

/**
 * Fixed type for Tshirt bounds configuration in format
 * [start: TshirtSize, end: TshirtSize].
 */
export type TshirtSizeBounds<TBounds extends TshirtBounds = never> = [
  TBounds,
] extends [never]
  ? [TshirtSize, TshirtSize]
  : [TshirtSize<TBounds>, TshirtSize<TBounds>];

/**
 * Convert a Tshirt number to a Tshirt size.
 * @example
 *  TshirtNumberToSize<-5>; // '4xs'
 *  TshirtNumberToSize<-2>; // 'xs'
 *  TshirtNumberToSize<-1>; // 'sm'
 *  TshirtNumberToSize<0>; // 'md'
 *  TshirtNumberToSize<1>; // 'lg'
 *  TshirtNumberToSize<2>; // 'xl'
 *  TshirtNumberToSize<5>; // '4xl'
 */
export type TshirtNumberToSize<TNumber extends number> = number extends TNumber
  ? TshirtSize
  : TNumber extends -2
    ? 'xs'
    : TNumber extends -1
      ? 'sm'
      : TNumber extends 0
        ? 'md'
        : TNumber extends 1
          ? 'lg'
          : TNumber extends 2
            ? 'xl'
            : IsNegative<TNumber> extends 1
              ? `${Subtract<Negate<TNumber>, 1>}xs`
              : IsPositive<TNumber> extends 1
                ? `${Subtract<TNumber, 1>}xl`
                : never;

/**
 * Convert a Tshirt number to a Tshirt size.
 * @example
 *  tshirtNumberToSize(-5); // '4xs'
 *  tshirtNumberToSize(-2); // 'xs'
 *  tshirtNumberToSize(-1); // 'sm'
 *  tshirtNumberToSize(0); // 'md'
 *  tshirtNumberToSize(1); // 'lg'
 *  tshirtNumberToSize(2); // 'xl'
 *  tshirtNumberToSize(5); // '4xl'
 */
export const tshirtNumberToSize = <TNumber extends number>(
  number: TNumber,
): TshirtNumberToSize<TNumber> => {
  type TResult = TshirtNumberToSize<TNumber>;

  if (Number.isFinite(number)) {
    if (number < -2) {
      return `${-1 * number - 1}xs` as TResult;
    }

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (number) {
      case -2: {
        return 'xs' as TResult;
      }

      case -1: {
        return 'sm' as TResult;
      }

      case 0: {
        return 'md' as TResult;
      }

      case 1: {
        return 'lg' as TResult;
      }

      case 2: {
        return 'xl' as TResult;
      }
    }

    if (number > 2) {
      return `${number - 1}xl` as TResult;
    }
  }

  throw new TypeError(`Invalid Tshirt number "${number}".`);
};

/**
 * Convert a Tshirt size to a Tshirt number.
 * @example
 *  TshirtSizeToNumber<'4xs'>; // -5
 *  TshirtSizeToNumber<'xs'>; // -2
 *  TshirtSizeToNumber<'sm'>; // -1
 *  TshirtSizeToNumber<'md'>; // 0
 *  TshirtSizeToNumber<'lg'>; // 1
 *  TshirtSizeToNumber<'xl'>; // 2
 *  TshirtSizeToNumber<'4xl'>; // 5
 */
export type TshirtSizeToNumber<TSize extends TshirtSize> = TSize extends 'xs'
  ? -2
  : TSize extends 'sm'
    ? -1
    : TSize extends 'md'
      ? 0
      : TSize extends 'lg'
        ? 1
        : TSize extends 'xl'
          ? 2
          : TSize extends `${infer TIndex extends number}xs`
            ? Negate<Add<TIndex, 1>>
            : TSize extends `${infer TIndex extends number}xl`
              ? Add<TIndex, 1>
              : never;

/**
 * Like {@link tshirtSizeToNumber} but returns undefined if invalid.
 */
export const tshirtSafeSizeToNumber = <TSize>(
  size: TSize,
): TSize extends TshirtSize ? TshirtSizeToNumber<TSize> : undefined => {
  type TResult = ReturnType<typeof tshirtSafeSizeToNumber<TSize>>;

  if (typeof size === 'string') {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (size) {
      case 'xs': {
        return -2 as TResult;
      }

      case 'sm': {
        return -1 as TResult;
      }

      case 'md': {
        return 0 as TResult;
      }

      case 'lg': {
        return 1 as TResult;
      }

      case 'xl': {
        return 2 as TResult;
      }
    }

    const result = /^(\d+)(xs|xl)$/.exec(size) ?? [];

    if (result) {
      const number = Number.parseInt(result[1], 10);
      if (result[2] === 'xs') {
        return (-1 * (number + 1)) as TResult;
      }

      if (result[2] === 'xl') {
        return (number + 1) as TResult;
      }
    }
  }

  return undefined as TResult;
};

/**
 * Convert a Tshirt size to a Tshirt number. Throws if invalid.
 * @example
 *  tshirtSizeToNumber('4xs'); // -5
 *  tshirtSizeToNumber('xs'); // -2
 *  tshirtSizeToNumber('sm'); // -1
 *  tshirtSizeToNumber('md'); // 0
 *  tshirtSizeToNumber('lg'); // 1
 *  tshirtSizeToNumber('xl'); // 2
 *  tshirtSizeToNumber('4xl'); // 5
 */
export const tshirtSizeToNumber = <TSize extends TshirtSize>(size: TSize) => {
  const number = tshirtSafeSizeToNumber(size);
  if (number === undefined) {
    throw new TypeError(`Invalid Tshirt size "${size}".`);
  }

  return number;
};

/**
 * Checks if a value is a {@link TshirtSize} size.
 * @private
 */
const _IsSize = (value: any): value is TshirtSize => {
  if (typeof value !== 'string') {
    return false;
  }

  if (['xs', 'sm', 'md', 'lg', 'xl'].includes(value)) {
    return true;
  }

  if (!/^\d+xs|xl$/.test(value)) {
    return false;
  }

  return true;
};

/**
 * Convert Tshirt size or number to number only.
 * @private
 */
type _ParseBound<T extends _Bound> = T extends TshirtSize
  ? TshirtSizeToNumber<T>
  : T extends number
    ? T
    : never;

/**
 * Convert Tshirt size or number to number only.
 * @private
 */
const _parseBound = <T extends _Bound>(
  bound: T,
): undefined | _ParseBound<T> => {
  type TResult = ReturnType<typeof _parseBound<T>>;

  if (_IsSize(bound)) {
    return tshirtSizeToNumber(bound) as TResult;
  }

  if (Number.isInteger(bound)) {
    return bound as TResult;
  }

  return undefined;
};

/**
 * Convert bounds containing sizes to numeric bounds.
 * @example ParseTshirtBounds<['xs', 'xl']>; // [-2, 2]
 */
export type ParseTshirtBounds<T extends TshirtBounds> = [
  _ParseBound<T[0]>,
  _ParseBound<T[Subtract<T['length'], 1>]>,
];

/**
 * Like {@link parseTshirtBounds} but returns undefined if invalid.
 */
export const safeParseTshirtBounds = <T extends TshirtBounds>(bounds: T) => {
  const start = bounds.at(0)!;
  const end = bounds.at(-1)!;
  const parsedStart = _parseBound(start);
  const parsedEnd = _parseBound(end);
  if (
    parsedStart === undefined ||
    parsedEnd === undefined ||
    !(parsedStart <= parsedEnd)
  ) {
    return undefined;
  }

  return [parsedStart, parsedEnd] as ParseTshirtBounds<T>;
};

/**
 * Convert bounds containing sizes to numeric bounds.
 * @example parseTshirtBounds(['xs', 'xl']); // [-2, 2]
 */
export const parseTshirtBounds = <T extends TshirtBounds>(bounds: T) => {
  const parsedBounds = safeParseTshirtBounds(bounds);
  if (!parsedBounds) {
    throw new TypeError(`Invalid Tshirt bounds "${String(bounds)}".`);
  }

  return parsedBounds;
};

/**
 * Creates a union of possible Tshirt sizes.
 * If bounds are provided it will limit those sizes.
 * @example
 *  TshirtSize<['2xs', '2xl']> // '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *  TshirtSize<[-3, 3]> // '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *  TshirtSize<[0, 5]> // 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
 */
export type TshirtSize<TBounds extends TshirtBounds = never> = [
  TBounds,
] extends [never]
  ? `${number}xs` | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | `${number}xl`
  : TshirtNumberToSize<
      IntegerRange<ParseTshirtBounds<TBounds>[0], ParseTshirtBounds<TBounds>[1]>
    >;

/**
 * Checks if an array of values is a valid Tshirt size.
 * If bounds are provided, it will also check that the size is within bounds.
 */
export const isTshirtSize = <TBounds extends TshirtBounds = never>(
  value: any,
  bounds?: TBounds,
): value is TshirtSize<TBounds> => {
  const number = tshirtSafeSizeToNumber(value);

  if (number === undefined) {
    return false;
  }

  if (!bounds) {
    return true;
  }

  const parsedBounds = parseTshirtBounds(bounds);
  if (!parsedBounds) {
    throw new TypeError(`Invalid Tshirt bounds "${String(bounds)}".`);
  }

  if (number < parsedBounds[0] || number > parsedBounds[1]) {
    return false;
  }

  return true;
};

/**
 * Like {@link isTshirtSize} but throws if invalid.
 */
export function assertTshirtSize<TBounds extends TshirtBounds = never>(
  value: any,
  bounds?: TBounds,
): asserts value is TshirtSize<TBounds> {
  if (!isTshirtSize(value, bounds)) {
    throw new TypeError(`Invalid Tshirt size "${String(value)}".`);
  }
}

/**
 * Checks if an array of values contain valid Tshirt sizes.
 * If bounds are provided, it will also check that the sizes are within bounds.
 */
export const isTshirtTuple = <TBounds extends TshirtBounds = never>(
  value: any,
  bounds?: TBounds,
): value is ReadonlyArray<TshirtSize<TBounds>> => {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((v) => isTshirtSize(v, bounds));
};

export function assertTshirtTuple<TBounds extends TshirtBounds = never>(
  value: any,
  bounds?: TBounds,
): asserts value is ReadonlyArray<TshirtSize<TBounds>> {
  if (!isTshirtTuple(value, bounds)) {
    throw new TypeError('Invalid Tshirt tuple.');
  }
}

/**
 * Convert a tuple of Tshirt size numbers to a tuple of Tshirt size strings.
 * @private
 */
type _IntegersToSize<
  TSource extends readonly number[],
  TResult extends readonly TshirtSize[] = [],
> = TSource extends [
  infer T extends number,
  ...infer TRest extends readonly number[],
]
  ? _IntegersToSize<TRest, [...TResult, TshirtNumberToSize<T>]>
  : TResult;

/**
 * Creates a sorted tuple type of sizes within the provided bounds.
 */
export type TshirtTuple<TBounds extends TshirtBounds> =
  Gt<TBounds['length'], 2> extends 1
    ? TBounds extends readonly TshirtSize[]
      ? TBounds
      : never
    : _IntegersToSize<
        IntegerRangeTuple<_ParseBound<TBounds[0]>, _ParseBound<TBounds[1]>>
      >;

/**
 * Creates a sorted tuple of sizes within the provided bounds.
 * @example
 *  createTshirtTuple(['2xs', '2xl']); // ['2xs', 'xs', 'sm', 'md', 'lg', 'xl']
 *  createTshirtTuple([-3, 3]); // ['2xs', 'xs', 'sm', 'md', 'lg', 'xl']
 *  createTshirtTuple([0, 5]); // ['md', 'lg', 'xl', '2xl', '3xl', '4xl']
 */
export const createTshirtTuple = <TBounds extends TshirtBounds>(
  bounds: TBounds,
): TshirtTuple<TBounds> => {
  type TReturn = ReturnType<typeof createTshirtTuple<TBounds>>;

  if (bounds.length > 2) {
    return bounds as TReturn;
  }

  const parsedBounds = parseTshirtBounds(bounds);
  return mapIntegerRange(
    parsedBounds[0],
    parsedBounds[1],
    tshirtNumberToSize,
  ) as TReturn;
};

/**
 * Determines the {@link TshirtBounds} from a sorted tuple of Tshirt sizes.
 */
export type TshirtTupleToBounds<TTuple extends readonly TshirtSize[]> =
  TTuple extends [infer T extends TshirtSize]
    ? [T, T]
    : TTuple extends [
          infer TStart extends TshirtSize,
          ...(readonly TshirtSize[]),
          infer TEnd extends TshirtSize,
        ]
      ? [TStart, TEnd]
      : never;

/**
 * Determines the {@link TshirtBounds} from a sorted tuple of Tshirt sizes.
 */
export const tshirtTupleToBounds = <TTuple extends readonly TshirtSize[]>(
  tshirtTuple: TTuple,
): TshirtTupleToBounds<TTuple> => {
  if (tshirtTuple.length > 0) {
    const result = [tshirtTuple.at(0), tshirtTuple.at(-1)] as ReturnType<
      typeof tshirtTupleToBounds<TTuple>
    >;
    assertTshirtTuple(result);
    return result;
  }

  throw new TypeError(`Invalid Tshirt tuple "${String(tshirtTuple)}".`);
};

/** @see {@link TshirtSizeToTuple} */
type _TshirtSizeToTuple<
  TSizeTuple extends readonly any[],
  TSize,
  TResult extends readonly any[] = [],
> = TSizeTuple extends [infer T, ...infer TRest extends readonly any[]]
  ? T extends TSize
    ? _TshirtSizeToTuple<TRest, TSize, [...TResult, T]>
    : _TshirtSizeToTuple<TRest, TSize, TResult>
  : TResult;

/**
 * Converts a union type of values to a filtered and sorted tuple type of those
 * Tshirt sizes. Requires a sorted array created from {@link createTshirtTuple}
 * as the firstvalue.
 * @example TshirtSizeToTuple<[...sizes], 'xs' | '2xs' | 'any' | 'xl' | 'md'>
 * // ['2xs', 'xs', 'md', 'xl']
 */
export type TshirtSizeToTuple<
  TSizeTuple extends readonly TshirtSize[],
  TSize extends TshirtSize,
> = _TshirtSizeToTuple<TSizeTuple, TSize>;

/**
 * Like {@link parseTshirtSizes} but does not throw for non-tshirt values.
 */
export const safeParseTshirtSizes = <
  TSizeTupleAll extends readonly TshirtSize[],
  TSizeTuple extends readonly any[],
>(
  sizeTupleAll: TSizeTupleAll,
  sizeTuple: TSizeTuple,
): TshirtSizeToTuple<TSizeTupleAll, TSizeTuple[number]> =>
  sizeTupleAll.filter((size) => sizeTuple.includes(size)) as ReturnType<
    typeof parseTshirtSizes<TSizeTupleAll, TSizeTuple>
  >;

/**
 * Converts a partial array of values to a sorted and deduped array of those
 * Tshirt sizes. Requires a sorted array created from {@link createTshirtTuple}
 * as the first value.
 * @example parseTshirtSizes['xs', '2xs', 'any', 'xl', 'md']
 * // ['2xs', 'xs', 'md', 'xl']
 */
export const parseTshirtSizes = <
  TSizeTupleAll extends readonly TshirtSize[],
  TSizeTuple extends readonly TshirtSize[],
>(
  sizeTupleAll: TSizeTupleAll,
  sizeTuple: TSizeTuple,
): TshirtSizeToTuple<TSizeTupleAll, TSizeTuple[number]> => {
  for (const size of sizeTuple) {
    assertTshirtSize(size);
  }

  return sizeTupleAll.filter((size) => {
    assertTshirtSize(size);
    return sizeTuple.includes(size);
  }) as ReturnType<typeof parseTshirtSizes<TSizeTupleAll, TSizeTuple>>;
};

/**
 * Creates a union of every permutation of [TshirtSizeA, TshirtSizeB]
 * where TshirtSizeA is less than TshirtSizeB.
 */
export type TshirtPairs<TBounds extends TshirtBounds = never> = [
  TBounds,
] extends [never]
  ? [TshirtSize, TshirtSize]
  : TshirtBounds &
      {
        [TSizeA in TshirtSize<TBounds> as string]: {
          [TSizeB in TshirtSize<
            [TSizeA, ParseTshirtBounds<TBounds>[1]]
          > as string]: TSizeA extends TSizeB ? never : [TSizeA, TSizeB];
        }[string];
      }[string];

/**
 * @private
 */
type _TshirtRecordExact<
  TBounds extends TshirtBounds,
  TSize extends TshirtSize,
  T,
> = Partial<Record<Exclude<TshirtSize<TBounds>, TSize>, never>> &
  Record<TSize, T>;

/**
 * Records a value onto keys of every possible permutation of sizes within
 * TBounds.
 */
export type TshirtRecord<TBounds extends TshirtBounds, T> =
  | {
      [S in TshirtSize<TBounds> as string]: _TshirtRecordExact<TBounds, S, T>;
    }[string]
  | {
      [P in TshirtPairs<TBounds> as string]: _TshirtRecordExact<
        TBounds,
        TshirtSize<P>,
        T
      >;
    }[string];
