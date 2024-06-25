const XS_SIZES = ['10xs', '9xs', '8xs', '7xs', '6xs', '5xs', '4xs', '3xs', '2xs'] as const;

const BASE_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const XL_SIZES = ['2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl', '10xl'] as const;

export const ALL_SIZES = [...XS_SIZES, ...BASE_SIZES, ...XL_SIZES] as const;

export const SIZE_INDEX_OFFSET = (-1 * ALL_SIZES.length / 2) + 0.5;

type AllSizes = typeof ALL_SIZES;

export type AnySize = typeof ALL_SIZES[number];

type MinSize = AllSizes[0];

const MIN_SIZE: MinSize = ALL_SIZES[0];

type MaxSize = AllSizes extends readonly [...readonly any[], infer T] ? T : never;

const MAX_SIZE = ALL_SIZES.at(-1) as MaxSize;

export type DefaultSizeRange = readonly [MinSize, MaxSize];

export const DEFAULT_SIZE_RANGE: DefaultSizeRange = [MIN_SIZE, MAX_SIZE];

type SizeTupleBefore<TSizeBefore extends AnySize, TTuple extends readonly AnySize[] = typeof ALL_SIZES> =
  TTuple extends readonly [...infer TRest extends readonly AnySize[], infer T extends AnySize]
    ? T extends TSizeBefore ? TRest : SizeTupleBefore<TSizeBefore, TRest> : [];

type SizeTupleAfter<TSizeAfter extends AnySize, TTuple extends readonly AnySize[] = typeof ALL_SIZES> =
TTuple extends readonly [infer T extends AnySize, ...infer TRest extends readonly AnySize[]]
  ? T extends TSizeAfter ? TRest : SizeTupleAfter<TSizeAfter, TRest> : [];

type SizeTupleBetween<TSizeAfter extends AnySize, TSizeBefore extends AnySize, TTuple extends readonly AnySize[] = typeof ALL_SIZES> =
  TTuple extends readonly [infer T extends AnySize, ...infer TRest extends readonly AnySize[]]
    ? T extends TSizeAfter ? SizeTupleBefore<TSizeBefore, TRest> : SizeTupleBetween<TSizeAfter, TSizeBefore, TRest> : [];

export type SizeRange<TMin extends AnySize = MinSize, TMax extends AnySize = MaxSize> = IfValidRange<TMin, TMax,
{
  [TThisMin in TMin | SizeTupleBetween<TMin, TMax>[number] as string]: {
    [TThisMax in SizeTupleBetween<TThisMin, TMax>[number] | TMax as string]: readonly [TThisMin, TThisMax]
  }[string]
}[string]>;

export type IfValidRange<TMin extends AnySize, TMax extends AnySize, TIfValid, TIfInvalid = never> =
  TMin extends TMax ? never :
    TMax extends TMin ? never :
      TMin extends SizeTupleAfter<TMax>[number] ? never
        : TIfValid;

export const isSizeRange = (value: any): value is SizeRange => {
  if (!Array.isArray(value)) {
    return false;
  }

  const [min, max] = value as [unknown, unknown];
  if (typeof min !== 'string' || typeof max !== 'string' || min === max) {
    return false;
  }

  let isMinValid = false;
  for (const thisSize of ALL_SIZES) {
    if (thisSize === min) {
      isMinValid = true;
      continue;
    }

    if (thisSize === max) {
      return isMinValid;
    }
  }

  return false;
};

export type SizeTuple<TRange extends SizeRange = DefaultSizeRange> = [TRange[0], ...SizeTupleBetween<TRange[0], TRange[1]>, TRange[1]];

export type Size<TRange extends SizeRange = DefaultSizeRange> = SizeTuple<TRange>[number];

export const isSize = <TSizeRange extends SizeRange = DefaultSizeRange>(value: any, [minSize, maxSize]: TSizeRange = DEFAULT_SIZE_RANGE as TSizeRange):
  value is Size<TSizeRange> => {
  let isMinValid = false;
  let isMaxValid = true;
  let isValueValid = false;
  for (const thisSize of ALL_SIZES) {
    if (thisSize === minSize) {
      isMinValid = true;
    }

    if (thisSize === value) {
      isValueValid = true;
      break;
    }

    if (thisSize === maxSize) {
      isMaxValid = false;
    }
  }

  return isMinValid && isMaxValid && isValueValid;
};

export const createSizesArray = <TSizeRange extends SizeRange = DefaultSizeRange>(range: TSizeRange = DEFAULT_SIZE_RANGE as TSizeRange) => {
  if (range === DEFAULT_SIZE_RANGE) {
    return ALL_SIZES;
  }

  if (!isSizeRange(range)) {
    throw new TypeError(`Invalid range "${String(range)}".`);
  }

  const sizesArray = [] as AnySize[];
  let isAboveOrEqualMin = false;
  for (const thisSize of ALL_SIZES) {
    if (thisSize === range[0]) {
      isAboveOrEqualMin = true;
    }

    if (isAboveOrEqualMin) {
      sizesArray.push(thisSize);
    }

    if (thisSize === range[1]) {
      break;
    }
  }

  return sizesArray as SizeTuple<TSizeRange>;
};

export const sizeToNumber = (size: AnySize): number => {
  const index = ALL_SIZES.indexOf(size);
  if (index === -1) {
    throw new TypeError(`Invalid size "${size}".`);
  }

  return index + SIZE_INDEX_OFFSET;
};
