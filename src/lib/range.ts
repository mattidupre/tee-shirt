import {
  type SizeRange, type Size, type AnySize,
  type DefaultSizeRange,
} from './size.js';

export type TshirtRangeSimple<TRange extends SizeRange = DefaultSizeRange> =
{
  [TThisMin in Size<TRange> as string]: {
    [TThisMax in [TThisMin, TRange[1]] extends SizeRange ? Size<[TThisMin, TRange[1]]> : never as string]: TThisMin extends TThisMax ? never : `${TThisMin}-${TThisMax}`
  }[string]
}[string];

export type TshirtRange<TRange extends SizeRange = DefaultSizeRange> = TshirtRangeSimple<TRange> | `${'min' | 'max'}-${Size<TRange>}`;

const rangeStringToRangeIndexes = (
  allSizes: readonly AnySize[],
  rangeString: TshirtRange,
): [number, number] => {
  const [from, to] = rangeString.split('-') as [
    AnySize | 'max' | 'min',
    AnySize,
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

  return [fromIndex, toIndex];
};

export const rangeToSizes = <TSize extends AnySize>(
  allSizes: readonly TSize[],
  rangeString: TshirtRange,
) => {
  const [fromIndex, toIndex] = rangeStringToRangeIndexes(allSizes, rangeString);
  return allSizes.slice(fromIndex, toIndex + 1);
};
