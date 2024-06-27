import {expect, test} from 'vitest';
import {
  type TshirtSize,
  createTshirtTuple,
  isTshirtSize,
  tshirtSizeToNumber,
  tshirtNumberToSize,
  parseTshirtSizes,
  safeParseTshirtSizes,
  tshirtTupleToBounds,
} from './size.js';

const ALL_SIZES = createTshirtTuple([-20, 20] as const);

test('isTshirtSize', () => {
  for (const thisSize of ALL_SIZES) {
    expect.soft(isTshirtSize(thisSize)).toBe(true);
  }

  expect.soft(isTshirtSize(undefined)).toBe(false);
  expect.soft(isTshirtSize(null)).toBe(false);
  expect.soft(isTshirtSize(0)).toBe(false);
  expect.soft(isTshirtSize('')).toBe(false);
  expect.soft(isTshirtSize([])).toBe(false);
  expect.soft(isTshirtSize({})).toBe(false);
});

test('createTshirtTuple', () => {
  expect.soft(createTshirtTuple(['md', '2xl'])).toEqual(['md', 'lg', 'xl', '2xl']);
  expect.soft(createTshirtTuple(['2xs', 'md'])).toEqual(['2xs', 'xs', 'sm', 'md']);
  expect.soft(() => createTshirtTuple(['lg', 'sm'] as any)).toThrowError();
});

test('tshirtSizeToNumber', () => {
  expect.soft(tshirtSizeToNumber('md')).toBe(0);
  expect.soft(tshirtSizeToNumber('10xs')).toBe(-11);
  expect.soft(tshirtSizeToNumber('10xl')).toBe(11);
  expect.soft(tshirtSizeToNumber('11xs')).toBe(-12);
  expect.soft(tshirtSizeToNumber('11xl')).toBe(12);
  expect.soft(() => tshirtSizeToNumber('_md' as TshirtSize)).toThrowError();
});

test('tshirtNumberToSize', () => {
  expect.soft(tshirtNumberToSize(0)).toBe('md');
  expect.soft(tshirtNumberToSize(-11)).toBe('10xs');
  expect.soft(tshirtNumberToSize(11)).toBe('10xl');
  expect.soft(tshirtNumberToSize(-12)).toBe('11xs');
  expect.soft(tshirtNumberToSize(12)).toBe('11xl');
  expect.soft(() => tshirtNumberToSize(Number.POSITIVE_INFINITY)).toThrowError();
  expect.soft(() => tshirtNumberToSize(Number.NEGATIVE_INFINITY)).toThrowError();
  expect.soft(() => tshirtNumberToSize(Number.NaN)).toThrowError();
});

test('parseTshirtSizes', () => {
  expect.soft(parseTshirtSizes(ALL_SIZES, ['md', 'lg', '3xs', '3xl'])).toEqual(['3xs', 'md', 'lg', '3xl']);
  expect.soft(() => parseTshirtSizes(ALL_SIZES, ['md', 'lg', 'INVALID', {}, '3xs', '3xl'] as any[])).toThrow();
});

test('safeParseTshirtSizes', () => {
  expect.soft(safeParseTshirtSizes(ALL_SIZES, ['md', 'lg', 'INVALID', {}, '3xs', '3xl'])).toEqual(['3xs', 'md', 'lg', '3xl']);
});

test('tshirtTupleToBounds', () => {
  expect.soft(tshirtTupleToBounds(ALL_SIZES)).toEqual(['19xs', '19xl']);
  expect.soft(tshirtTupleToBounds(['md'])).toEqual(['md', 'md']);
  expect.soft(() => tshirtTupleToBounds(['one', 'two', 'three'] as unknown as readonly TshirtSize[])).toThrow();
  // Only checks the first and the last values:
  expect.soft(() => tshirtTupleToBounds(['sm', 'two', 'lg'] as unknown as readonly TshirtSize[])).not.toThrow();
});
