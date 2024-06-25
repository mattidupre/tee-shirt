import {expect, test} from 'vitest';
import {
  ALL_SIZES,
  type AnySize,
  createSizesArray,
  isSize,
  isSizeRange,
  sizeToNumber,
} from './size.js';

test('isSize', () => {
  for (const thisSize of ALL_SIZES) {
    expect.soft(isSize(thisSize)).toBe(true);
  }

  expect.soft(isSize(undefined)).toBe(false);
  expect.soft(isSize(null)).toBe(false);
  expect.soft(isSize(0)).toBe(false);
  expect.soft(isSize('')).toBe(false);
  expect.soft(isSize([])).toBe(false);
  expect.soft(isSize({})).toBe(false);
  expect.soft(isSize('11xs')).toBe(false);
  expect.soft(isSize('11xl')).toBe(false);
});

test('isSizeRange', () => {
  for (const thisSizeA of ALL_SIZES) {
    for (const thisSizeB of ALL_SIZES.slice(ALL_SIZES.indexOf(thisSizeA) + 1)) {
      expect.soft(isSizeRange([thisSizeA, thisSizeB])).toBe(true);
    }
  }

  expect.soft(isSizeRange(undefined)).toBe(false);
  expect.soft(isSizeRange(null)).toBe(false);
  expect.soft(isSizeRange(0)).toBe(false);
  expect.soft(isSizeRange('')).toBe(false);
  expect.soft(isSizeRange([])).toBe(false);
  expect.soft(isSizeRange({})).toBe(false);
  expect.soft(isSizeRange(['10xl', '10xs'])).toBe(false);
  expect.soft(isSizeRange(['lg', 'sm'])).toBe(false);
  expect.soft(isSizeRange(['11xs', '10xl'])).toBe(false);
  expect.soft(isSizeRange(['10xs', '11xl'])).toBe(false);
});

test('createTshirtSizes', () => {
  expect.soft(createSizesArray()).toEqual(ALL_SIZES);
  expect.soft(createSizesArray(['10xs', '10xl'])).toEqual(ALL_SIZES);
  expect.soft(createSizesArray(['md', '2xl'])).toEqual(['md', 'lg', 'xl', '2xl']);
  expect.soft(createSizesArray(['2xs', 'md'])).toEqual(['2xs', 'xs', 'sm', 'md']);
  expect.soft(() => createSizesArray(['lg', 'sm'] as any)).toThrowError();
});

test('sizeToNumber', () => {
  expect.soft(sizeToNumber('md')).toBe(0);
  expect.soft(sizeToNumber('10xs')).toBe(-11);
  expect.soft(sizeToNumber('10xl')).toBe(11);
  expect.soft(() => sizeToNumber('11xs' as AnySize)).toThrowError();
  expect.soft(() => sizeToNumber('11xl' as AnySize)).toThrowError();
});
