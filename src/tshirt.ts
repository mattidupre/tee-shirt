import {
  type ReverseTuple,
  type SuffixTupleValues,
  type WritableTuple,
} from './types/tuple.js';
import type {
  IntegerRange,
  IntegerRangeTuple,
  IntegerAdd,
} from './types/integer';

const BASE_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

type BaseSizes = typeof BASE_SIZES;

const TSHIRT_REGULAR_EXPRESSION = new RegExp(
  `^([0-9]*)(${BASE_SIZES.join('|')})$`,
);

const MAX_SIZE_NUMBER = 10;

type SizeNumber = IntegerRange<1, IntegerAdd<typeof MAX_SIZE_NUMBER, 1>>;

function assertSizeNumber<TSizeNumber extends SizeNumber = SizeNumber>(
  value: any,
  sizeNumber: TSizeNumber = MAX_SIZE_NUMBER as TSizeNumber,
): asserts value is TSizeNumber {
  if (typeof value !== 'number' || value < 1 || value > sizeNumber) {
    throw new TypeError(`Size must be a number between 1 and ${sizeNumber}.`);
  }
}

const parseMinMax = <
  TNumberMin extends SizeNumber,
  TNumberMax extends SizeNumber = TNumberMin,
>(
  numberMin: undefined | TNumberMin,
  numberMax: undefined | TNumberMax,
  assert?: boolean,
) => {
  const min = numberMin ?? 1;

  const max = numberMax ?? numberMin ?? 1;

  if (assert) {
    assertSizeNumber(min);
    assertSizeNumber(max);
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {min, max} as {min: TNumberMin; max: TNumberMax};
};

type SizeNumberTuple<TNumber extends SizeNumber> = IntegerRangeTuple<
  2,
  IntegerAdd<TNumber, 1>
>;

/**
 * Encompasses all possible Tshirt sizes.
 */
export type TshirtSizeGeneric =
  | `${Exclude<SizeNumber, 1>}xs`
  | BaseSizes[number]
  | `${Exclude<SizeNumber, 1>}xl`;

/**
 * Extract number and size from a Tshirt size. Number is 1 for sm, md, lg, etc.
 * Optionally provide expected Min and Max to assert number is within range.
 * @example parseTshirtSize('3xl'); // { number: 3, size: 'xl' }
 * @example parseTshirtSize('md'); // { number: 1, size: 'md' }
 * @example parseTshirtSize('3xl', 2); // throws
 */
export const parseTshirtSize = <
  TNumberMin extends SizeNumber = typeof MAX_SIZE_NUMBER,
  TNumberMax extends SizeNumber = TNumberMin,
>(
  size: TshirtSizeGeneric,
  numberMin: TNumberMin = MAX_SIZE_NUMBER as TNumberMin,
  numberMax?: TNumberMax,
) => {
  const {min, max} = parseMinMax(numberMin, numberMax);

  const [, n, b] = TSHIRT_REGULAR_EXPRESSION.exec(size) ?? [];
  const sizeBase = b || undefined;
  const sizeInt = n ? Number.parseInt(n, 10) : undefined;

  if (sizeBase === undefined) {
    throw new TypeError(`Invalid size "${size}".`);
  }

  if (
    sizeInt !== undefined &&
    !(
      (sizeBase === 'xl' && sizeInt >= 2 && sizeInt <= max) ||
      (sizeBase === 'xs' && sizeInt >= 2 && sizeInt <= min)
    )
  ) {
    throw new TypeError(`Invalid size "${size}".`);
  }

  return [sizeInt, sizeBase] as [
    number: undefined | SizeNumber,
    size: BaseSizes[number],
  ];
};

/**
 * Create a tuple representing possible sizes sorted from small to large.
 * Optionally provide min and max to limit range.
 * @example CreateTshirtSizeTuple // ['xs', 'sm', 'md', 'lg', 'xl']
 * @example CreateTshirtSizeTuple<2> // ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
 * @example CreateTshirtSizeTuple<1, 2> // ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
 */
export type CreateTshirtSizeTuple<
  TNumberMin extends SizeNumber = 1,
  TNumberMax extends SizeNumber = TNumberMin,
> = [
  ...SuffixTupleValues<ReverseTuple<SizeNumberTuple<TNumberMin>>, 'xs'>,
  ...BaseSizes,
  ...SuffixTupleValues<WritableTuple<SizeNumberTuple<TNumberMax>>, 'xl'>,
];

/**
 * Same as {@link CreateTshirtSizeTuple} but returns a union of sizes.
 */
export type CreateTshirtSize<
  TNumberMin extends SizeNumber = 1,
  TNumberMax extends SizeNumber = TNumberMin,
> = CreateTshirtSizeTuple<TNumberMin, TNumberMax>[number];

/**
 * Create a tuple representing possible sizes sorted from small to large.
 * Optionally provide min and max to limit range.
 * @example createTshirtSizes(); // ['xs', 'sm', 'md', 'lg', 'xl']
 * @example createTshirtSizes(2); // ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
 * @example createTshirtSizes(1, 2); // ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
 */
export const createTshirtSizes = <
  TNumberMin extends SizeNumber = 1,
  TNumberMax extends SizeNumber = TNumberMin,
>(
  numberMin?: TNumberMin,
  numberMax?: TNumberMax,
) => {
  const {min, max} = parseMinMax(numberMin, numberMax, true);

  const minSizes: string[] = [];
  const maxSizes: string[] = [];
  for (let n: number = min; n >= 2; n -= 1) {
    minSizes.push(`${n}xs`);
  }

  for (let n: number = max; n >= 2; n -= 1) {
    maxSizes.unshift(`${n}xl`);
  }

  return [...minSizes, ...BASE_SIZES, ...maxSizes] as CreateTshirtSizeTuple<
    TNumberMin,
    TNumberMax
  >;
};

/**
 * Given a tuple of sizes, create another tuple representing possible ranges.
 * @example TshirtSizesToRanges<['sm', 'md', 'lg']>;
 * // [
 * // 'max-sm',
 * // 'sm-md',
 * // 'sm-lg',
 * // 'min-sm',
 * // 'max-md',
 * // 'md-lg',
 * // 'min-md',
 * // 'max-lg',
 * // 'min-lg',
 * // ]
 */
export type TshirtSizesToRanges<TTuple extends readonly TshirtSizeGeneric[]> =
  TTuple extends readonly [
    infer T extends TshirtSizeGeneric,
    ...infer TRest extends readonly TshirtSizeGeneric[],
  ]
    ? [
        `max-${T}`,
        ...(TTuple extends readonly [...any[]]
          ? {
              [K in keyof TTuple]: TTuple[K] extends number | string | bigint
                ? `${T}-${TTuple[K]}`
                : TTuple[K];
            }
          : never),
        `min-${T}`,
        ...TshirtSizesToRanges<TRest>,
      ]
    : []; // eslint-disable-line @typescript-eslint/ban-types

/**
 * Given a tuple of sizes, create another tuple representing possible ranges.
 * @example tshirtSizesToRanges(['sm', 'md', 'lg']);
 * // [
 * // 'max-sm',
 * // 'sm-md',
 * // 'sm-lg',
 * // 'min-sm',
 * // 'max-md',
 * // 'md-lg',
 * // 'min-md',
 * // 'max-lg',
 * // 'min-lg',
 * // ]
 */
export const tshirtSizesToRanges = <
  TTuple extends readonly TshirtSizeGeneric[],
>(
  tuple: TTuple,
): TshirtSizesToRanges<TTuple> => {
  const [t1, ...rest] = tuple;

  if (t1 === undefined) {
    return [] as TshirtSizesToRanges<TTuple>;
  }

  return [
    `max-${t1}`,
    ...rest.map((t) => `${t1}-${t}`),
    `min-${t1}`,
    ...tshirtSizesToRanges(rest),
  ] as TshirtSizesToRanges<TTuple>;
};

/**
 * Encompasses all possible Tshirt ranges.
 */
export type TshirtRangeGeneric = keyof {
  [T in TshirtSizeGeneric as
    | `max-${T}`
    | `${T}-${Exclude<TshirtSizeGeneric, T>}`
    | `min-${T}`]: any;
};

/**
 * Given a tuple of sizes and a range, return the beginning and end indexes of that range.
 */
export const tshirtRangeToIndexes = (
  allSizes: readonly TshirtSizeGeneric[],
  range: TshirtRangeGeneric,
): [number, number] => {
  const [from, to] = range.split('-') as [
    TshirtSizeGeneric | 'max' | 'min',
    TshirtSizeGeneric,
  ];
  let fromIndex = -1;
  let toIndex = -1;
  if (from === 'min') {
    fromIndex = allSizes.indexOf(to);
    toIndex = allSizes.length - 1;
  } else if (from === 'max') {
    fromIndex = 0;
    toIndex = allSizes.indexOf(to);
  } else {
    fromIndex = allSizes.indexOf(from);
    toIndex = allSizes.indexOf(to);
  }

  if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
    throw new TypeError(`Invalid range "${range}".`);
  }

  return [fromIndex, toIndex];
};

/**
 * Given a tuple of sizes and a range, return an array of all matching sizes.
 */
export const tshirtRangesToSizes = <
  TTshirtSizes extends readonly TshirtSizeGeneric[],
>(
  allSizes: TTshirtSizes,
  tshirtRanges: readonly TshirtRangeGeneric[],
): Array<TTshirtSizes[number]> => {
  const stepIndexes = new Set<number>();
  for (const range of tshirtRanges) {
    const [fromIndex, toIndex] = tshirtRangeToIndexes(allSizes, range);
    for (let index = fromIndex; index <= toIndex; index += 1) {
      stepIndexes.add(index);
    }
  }

  return [...stepIndexes] // eslint-disable-line @typescript-eslint/require-array-sort-compare
    .sort()
    .map((index) => allSizes[index]);
};
