/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {expect, test} from 'vitest';
import {
  createTshirtSizes,
  parseTshirtSize,
  tshirtSizesToRanges,
  tshirtRangesToSizes,
} from './tshirt.js';

test('createTshirtSizes', () => {
  const BASE_SIZES = Object.freeze(createTshirtSizes());

  expect.soft(BASE_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
  expect.soft(createTshirtSizes(2)).toEqual(['2xs', ...BASE_SIZES, '2xl']);
  expect
    .soft(createTshirtSizes(4))
    .toEqual(['4xs', '3xs', '2xs', ...BASE_SIZES, '2xl', '3xl', '4xl']);
  expect
    .soft(createTshirtSizes(2, 3))
    .toEqual(['2xs', ...BASE_SIZES, '2xl', '3xl']);
  expect
    .soft(createTshirtSizes(2, 3))
    .toEqual(['2xs', ...BASE_SIZES, '2xl', '3xl']);
  expect.soft(createTshirtSizes(undefined, 2)).toEqual([...BASE_SIZES, '2xl']);
  expect
    .soft(createTshirtSizes(2, undefined))
    .toEqual(['2xs', ...BASE_SIZES, '2xl']);
  expect.soft(() => createTshirtSizes(0 as any, 2)).toThrow();
  expect.soft(() => createTshirtSizes(2, 0 as any)).toThrow();
});

test('parseTshirtSize', () => {
  expect.soft(parseTshirtSize('2xl')).toEqual([2, 'xl']);
  expect.soft(parseTshirtSize('2xl', 2)).toEqual([2, 'xl']);
  expect.soft(parseTshirtSize('2xl', undefined, 2)).toEqual([2, 'xl']);
  expect.soft(parseTshirtSize('2xl', 1, 2)).toEqual([2, 'xl']);
  expect.soft(() => parseTshirtSize('2xl', 2, 1)).toThrowError();
  expect.soft(() => parseTshirtSize('2xl', undefined, 1)).toThrowError();
  expect.soft(() => parseTshirtSize('11xl' as any)).toThrowError();

  expect.soft(parseTshirtSize('2xs')).toEqual([2, 'xs']);
  expect.soft(parseTshirtSize('2xs', 2)).toEqual([2, 'xs']);
  expect.soft(parseTshirtSize('2xs', 2, undefined)).toEqual([2, 'xs']);
  expect.soft(parseTshirtSize('2xs', 2, 1)).toEqual([2, 'xs']);
  expect.soft(() => parseTshirtSize('2xs', 1, 2)).toThrowError();
  expect.soft(() => parseTshirtSize('2xs', 1, undefined)).toThrowError();
  expect.soft(() => parseTshirtSize('11xs' as any)).toThrowError();

  expect.soft(parseTshirtSize('xl')).toEqual([undefined, 'xl']);
  expect.soft(parseTshirtSize('md')).toEqual([undefined, 'md']);
  expect.soft(parseTshirtSize('xs')).toEqual([undefined, 'xs']);

  expect.soft(() => parseTshirtSize('2md' as any)).toThrowError();
});

test('tshirtSizesToRanges', () => {
  expect
    .soft(tshirtSizesToRanges(['sm', 'md', 'lg']))
    .toEqual([
      'max-sm',
      'sm-md',
      'sm-lg',
      'min-sm',
      'max-md',
      'md-lg',
      'min-md',
      'max-lg',
      'min-lg',
    ]);
});

test('tshirtRangesToSizes', () => {
  const BASE_SIZES = Object.freeze(createTshirtSizes(3));

  expect.soft(tshirtRangesToSizes(BASE_SIZES, ['sm-md'])).toEqual(['sm', 'md']);
  expect
    .soft(tshirtRangesToSizes(BASE_SIZES, ['3xs-sm']))
    .toEqual(['3xs', '2xs', 'xs', 'sm']);
  expect
    .soft(tshirtRangesToSizes(BASE_SIZES, ['3xs-sm', 'lg-3xl']))
    .toEqual(['3xs', '2xs', 'xs', 'sm', 'lg', 'xl', '2xl', '3xl']);
  expect
    .soft(tshirtRangesToSizes(BASE_SIZES, ['md-lg', 'xs-md']))
    .toEqual(['xs', 'sm', 'md', 'lg']);
  expect
    .soft(tshirtRangesToSizes(BASE_SIZES, ['max-md']))
    .toEqual(['3xs', '2xs', 'xs', 'sm', 'md']);
  expect
    .soft(tshirtRangesToSizes(BASE_SIZES, ['min-md']))
    .toEqual(['md', 'lg', 'xl', '2xl', '3xl']);
});
