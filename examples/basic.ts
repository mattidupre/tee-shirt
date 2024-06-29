import {
  createTshirtTuple,
  type TshirtBounds,
  type TshirtRange,
  tshirtRangeToSizes,
  type TshirtSize,
  tshirtSizeToNumber,
} from 'tee-shirt';

const BOUNDS = ['3xs', '3xl'] as const satisfies TshirtBounds;

type Size = TshirtSize<typeof BOUNDS>;

const TSHIRTS = createTshirtTuple(BOUNDS);

expect(TSHIRTS).toStrictEqual([
  '3xs',
  '2xs',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
]);

expect(tshirtSizeToNumber('3xs')).toBe(-4);
expect(tshirtSizeToNumber('md')).toBe(0);
expect(tshirtSizeToNumber('3xl')).toBe(4);

const tshirts = (...ranges: readonly TshirtRange[]) =>
  tshirtRangeToSizes(TSHIRTS, ...ranges);

expect(tshirts('sm-lg')).toStrictEqual(['sm', 'md', 'lg']);

expect(tshirts('min-md')).toStrictEqual(['md', 'lg', 'xl', '2xl', '3xl']);

expect(tshirts('max-md')).toStrictEqual(['3xs', '2xs', 'xs', 'sm', 'md']);

expect(tshirts('3xs', 'sm-lg', '3xl')).toStrictEqual([
  '3xs',
  'sm',
  'md',
  'lg',
  '3xl',
]);

expect(tshirts('lg', 'sm', 'lg', 'xs-sm')).toStrictEqual(['xs', 'sm', 'lg']);
