import {
  type TshirtBounds,
  type TshirtSize,
  type TshirtTupleToBounds,
  safeParseTshirtSizes,
  createTshirtTuple,
  isTshirtSize,
  tshirtTupleToBounds,
  isTshirtTuple,
  safeParseTshirtBounds,
  ParseTshirtBounds,
  type TshirtPairs,
} from './size.js';

/**
 * Options argument for {@link tshirtRangeToSizes}
 */
export type TshirtRangeOptions = {
  exclusiveMin?: boolean;
  exclusiveLeft?: boolean;
  exclusiveMax?: boolean;
  exclusiveRight?: boolean;
};

/**
 * Creates a union of ranges between {@link TshirtSize} strings.
 * If bounds are provided it will limit those sizes.
 * @example
 *  TshirtRangeSimple // `${TshirtSize}-${TshirtSize}`
 *  TshirtRangeSimple<['sm', 'lg']> // 'sm-md' | 'sm-lg' | 'md-lg'
 */
export type TshirtRangeSimple<TBounds extends TshirtBounds = never> = [
  TBounds,
] extends [never]
  ? `${TshirtSize}-${TshirtSize}`
  : keyof {
      [P in TshirtPairs<TBounds> as `${P[0]}-${P[1]}`]: any;
    };

/**
 * Checks if a value is of type {@link TshirtRangeSimple}.
 */
export const isTshirtRangeSimple = <
  TAllSizes extends readonly TshirtSize[] = never,
>(
  value: any,
  allSizes?: TAllSizes,
): value is TshirtRangeSimple<TshirtTupleToBounds<TAllSizes>> => {
  if (typeof value !== 'string') {
    return false;
  }

  const result = value.split('-');
  if (result.length !== 2) {
    return false;
  }

  const bounds = allSizes && tshirtTupleToBounds(allSizes);
  if (!isTshirtTuple(result, bounds)) {
    return false;
  }

  if (safeParseTshirtBounds(result as unknown as TshirtBounds) === undefined) {
    return false;
  }

  return true;
};

/**
 * Creates a union of \`min-${{@link TshirtSize}}\` strings.
 * If bounds are provided it will limit those sizes.
 * @example
 *  TshirtRangeMin // `min-${TshirtSize}`
 *  TshirtRangeMin<['sm', 'lg']> // 'min-sm' | 'min-md' | 'min-lg'
 */
export type TshirtRangeMin<TRange extends TshirtBounds = never> =
  `min-${TshirtSize<TRange>}`;

/**
 * Checks if a value is of type {@link TshirtRangeMin}.
 */
export const isTshirtRangeMin = <
  TAllSizes extends readonly TshirtSize[] = never,
>(
  value: any,
  allSizes?: TAllSizes,
): value is TshirtRangeMin<TshirtTupleToBounds<TAllSizes>> => {
  if (typeof value !== 'string') {
    return false;
  }

  const [min, size] = value.split('-');
  if (min !== 'min') {
    return false;
  }

  if (!isTshirtSize(size, allSizes && tshirtTupleToBounds(allSizes))) {
    return false;
  }

  return true;
};

/**
 * Creates a union of \`max-${{@link TshirtSize}}\` strings.
 * If bounds are provided it will limit those sizes.
 * @example
 *  TshirtRangeMin // `max-${TshirtSize}`
 *  TshirtRangeMax<['sm', 'lg']> // 'max-sm' | 'max-md' | 'max-lg'
 */
export type TshirtRangeMax<TRange extends TshirtBounds = never> =
  `max-${TshirtSize<TRange>}`;

/**
 * Checks if a value is of type {@link TshirtRangeMax}.
 */
export const isTshirtRangeMax = <
  TAllSizes extends readonly TshirtSize[] = never,
>(
  value: any,
  allSizes?: TAllSizes,
): value is TshirtRangeMax<TshirtTupleToBounds<TAllSizes>> => {
  if (typeof value !== 'string') {
    return false;
  }

  const [min, size] = value.split('-');

  if (min !== 'max') {
    return false;
  }

  if (!isTshirtSize(size, allSizes && tshirtTupleToBounds(allSizes))) {
    return false;
  }

  return true;
};

/**
 * Creates a union of the following:
 * * {@link TshirtSize}
 * * {@link TshirtRangeSimple}
 * * {@link TshirtRangeMin}
 * * {@link TshirtRangeMax}
 *
 * If bounds are provided it will limit those sizes.
 */
export type TshirtRange<TRange extends TshirtBounds = never> =
  | 'all'
  | 'none'
  | TshirtSize<TRange>
  | TshirtRangeSimple<TRange>
  | TshirtRangeMin<TRange>
  | TshirtRangeMax<TRange>;

/**
 * Checks if a value is of type {@link TShirtRange}.
 */
export const isTshirtRange = <TAllSizes extends readonly TshirtSize[] = never>(
  value: any,
  allSizes?: TAllSizes,
): value is TshirtRange<TshirtTupleToBounds<TAllSizes>> =>
  isTshirtSize(value, allSizes && tshirtTupleToBounds(allSizes)) ||
  isTshirtRangeSimple(value, allSizes) ||
  isTshirtRangeMin(value, allSizes) ||
  isTshirtRangeMax(value, allSizes);

/**
 * Convert a single Tshirt size range to an index range.
 * @private
 */
const _rangeToIndexRange = (
  allSizes: readonly TshirtSize[],
  rangeString: Exclude<TshirtRange, 'all' | 'none'>,
  options: TshirtRangeOptions,
): [number, number] => {
  const [from, to] = rangeString.split('-') as [
    TshirtSize | 'max' | 'min',
    TshirtSize,
  ];
  let fromIndex = -1;
  let toIndex = -1;

  if (from === 'min') {
    fromIndex = allSizes.indexOf(to);
    toIndex = Number.POSITIVE_INFINITY;
  } else if (from === 'max') {
    fromIndex = Number.NEGATIVE_INFINITY;
    toIndex = allSizes.indexOf(to);
  } else {
    fromIndex = allSizes.indexOf(from);
    toIndex = allSizes.indexOf(to);
  }

  if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
    throw new TypeError(`Invalid range "${rangeString}".`);
  }

  if (
    options.exclusiveLeft === true ||
    (options.exclusiveMin === true && isTshirtRangeMin(rangeString))
  ) {
    fromIndex += 1;
  }

  if (
    options.exclusiveRight === true ||
    (options.exclusiveMax === true && isTshirtRangeMax(rangeString))
  ) {
    toIndex -= 1;
  }

  return [fromIndex, toIndex];
};

/**
 * Convert a single range to the respective sizes in the provided Tshirt size array.
 * @private
 */
const _singleRangeToSizes = <TSize extends TshirtSize>(
  allSizes: readonly TSize[],
  rangeString: TshirtRange,
  options: TshirtRangeOptions,
): TSize[] => {
  if (allSizes.includes(rangeString as TSize)) {
    return [rangeString] as TSize[];
  }

  if (rangeString === 'all') {
    return [...allSizes];
  }

  if (rangeString === 'none') {
    return [];
  }

  const [fromIndex, toIndex] = _rangeToIndexRange(
    allSizes,
    rangeString,
    options,
  );

  return allSizes.slice(fromIndex, toIndex + 1);
};

/**
 * Convert one or more ranges to an array of matching sizes.
 * Requires an array of all sizes as the first argument.
 * @example
 *   const SIZES = createTshirtTuple([-3, 3]);
 *   tshirtRangeToSizes(SIZES, 'sm-lg');
 *     // ['sm', 'md', 'lg']
 *   tshirtRangeToSizes(SIZES, '2xs-xs', 'md', 'lg-2xl');
 *     // ['2xs', 'xs', 'md', 'lg', 'xl', '2xl']
 *   tshirtRangeTSizes(SIZES, 'all');
 *     // ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
 *   tshirtRangeTSizes(SIZES, 'none');
 *     // []
 *   tshirtRangeTSizes(SIZES, 'none', 'md');
 *     // ['md']
 *   tshirtRangeToSizes(SIZES, { exclusiveLeft: true }, 'sm-lg');
 *     // ['md', 'lg']
 *   tshirtRangeToSizes(SIZES, { exclusiveMin: true }, 'min-md');
 *     // ['lg', 'xl', '2xl']
 *   tshirtRangeToSizes(SIZES, { exclusiveRight: true }, 'sm-lg');
 *     // ['sm', 'md']
 *   tshirtRangeToSizes(SIZES, { exclusiveMax: true }, 'max-md');
 *     // ['2xl', 'xs', 'sm']
 */
export const tshirtRangeToSizes = <TBounds extends TshirtBounds>(
  bounds: TBounds,
  options?: TshirtRange | readonly TshirtRange[] | TshirtRangeOptions,
  ...ranges: ReadonlyArray<TshirtRange | TshirtRange[]>
): Array<TshirtSize<TBounds>> => {
  const allSizes = createTshirtTuple(bounds) as Array<TshirtSize<TBounds>>;
  const parsedRanges: TshirtRange[] = [];
  let parsedOptions: TshirtRangeOptions = {};
  if (typeof options === 'string') {
    parsedRanges.push(options);
  } else if (Array.isArray(options)) {
    parsedRanges.push(...(options as TshirtRange[]));
  } else if (typeof options === 'object' && options !== null) {
    parsedOptions = options as TshirtRangeOptions;
  } else if (options !== undefined) {
    throw new TypeError(`Invalid options "${String(options)}".`);
  }

  parsedRanges.push(...ranges.flat());

  if (parsedRanges.length === 0) {
    return [];
  }

  if (parsedRanges.length === 1) {
    return _singleRangeToSizes(allSizes, parsedRanges[0], parsedOptions);
  }

  if (parsedRanges.includes('all')) {
    return [...allSizes];
  }

  const allMatchedSizes: TshirtSize[] = [];
  for (const rangeString of parsedRanges) {
    for (const size of _singleRangeToSizes(
      allSizes,
      rangeString,
      parsedOptions,
    )) {
      allMatchedSizes.push(size);
    }
  }

  // safe method is faster
  return safeParseTshirtSizes(allSizes, allMatchedSizes);
};
