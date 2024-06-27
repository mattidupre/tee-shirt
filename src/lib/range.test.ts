import {expect, test} from 'vitest';
import {
  isTshirtRangeMin,
  isTshirtRangeMax,
  tshirtRangeToSizes,
  isTshirtRangeSimple,
  isTshirtRange,
} from './range.js';
import {createTshirtTuple} from './size.js';

const TSHIRT_TUPLE = createTshirtTuple(['2xs', '2xl']);

test('tshirtRangeToSizes', () => {
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, 'all'))
    .toStrictEqual(TSHIRT_TUPLE);
  expect.soft(tshirtRangeToSizes(TSHIRT_TUPLE, 'none')).toStrictEqual([]);

  expect.soft(tshirtRangeToSizes(TSHIRT_TUPLE, 'md')).toStrictEqual(['md']);
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, 'none', 'md'))
    .toStrictEqual(['md']);
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, {exclusiveRight: true}, ['md']))
    .toStrictEqual(['md']);

  // TODO: The following two are a bit weird. Get rid of exclusive(Left|Right)?
  expect
    .soft(
      tshirtRangeToSizes(TSHIRT_TUPLE, {exclusiveRight: true}, ['md', 'lg']),
    )
    .toStrictEqual(['md', 'lg']);
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, {exclusiveRight: true}, ['md-lg']))
    .toStrictEqual(['md']);

  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, 'max-2xs'))
    .toStrictEqual(['2xs']);
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, 'max-md'))
    .toStrictEqual(['2xs', 'xs', 'sm', 'md']);
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, {exclusiveMax: true}, 'max-md'))
    .toStrictEqual(['2xs', 'xs', 'sm']);
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, {exclusiveRight: true}, 'max-md'))
    .toStrictEqual(['2xs', 'xs', 'sm']);

  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, 'min-2xl'))
    .toStrictEqual(['2xl']);
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, 'min-md'))
    .toStrictEqual(['md', 'lg', 'xl', '2xl']);
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, {exclusiveMin: true}, 'min-md'))
    .toStrictEqual(['lg', 'xl', '2xl']);
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, {exclusiveLeft: true}, 'min-md'))
    .toStrictEqual(['lg', 'xl', '2xl']);

  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, 'sm-lg'))
    .toStrictEqual(['sm', 'md', 'lg']);
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, {exclusiveLeft: true}, 'sm-lg'))
    .toStrictEqual(['md', 'lg']);
  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, {exclusiveRight: true}, 'sm-lg'))
    .toStrictEqual(['sm', 'md']);

  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, 'sm-md', 'xl-2xl'))
    .toStrictEqual(['sm', 'md', 'xl', '2xl']);

  expect
    .soft(tshirtRangeToSizes(TSHIRT_TUPLE, 'max-md'))
    .toStrictEqual(['2xs', 'xs', 'sm', 'md']);
});

test('isTshirtRangeSimple', () => {
  expect.soft(isTshirtRangeSimple('100xs-100xl')).toBe(true);
  expect.soft(isTshirtRangeSimple('sm-lg', TSHIRT_TUPLE)).toBe(true);
  expect.soft(isTshirtRangeSimple('min-md')).toBe(false);
  expect.soft(isTshirtRangeSimple('max-md')).toBe(false);
  expect.soft(isTshirtRangeSimple('md')).toBe(false);
  expect.soft(isTshirtRangeSimple('100xs-100xl', TSHIRT_TUPLE)).toBe(false);
  expect.soft(isTshirtRangeSimple('lg-sm')).toBe(false);
});

test('isTshirtRangeMin', () => {
  expect.soft(isTshirtRangeMin('min-100xl')).toBe(true);
  expect.soft(isTshirtRangeMin('min-md', TSHIRT_TUPLE)).toBe(true);
  expect.soft(isTshirtRangeMin('max-md')).toBe(false);
  expect.soft(isTshirtRangeMin('sm-lg')).toBe(false);
  expect.soft(isTshirtRangeMin('md')).toBe(false);
  expect.soft(isTshirtRangeMin('min-100xl', TSHIRT_TUPLE)).toBe(false);
});

test('isTshirtRangeMax', () => {
  expect.soft(isTshirtRangeMax('max-100xl')).toBe(true);
  expect.soft(isTshirtRangeMax('max-md', TSHIRT_TUPLE)).toBe(true);
  expect.soft(isTshirtRangeMax('min-md')).toBe(false);
  expect.soft(isTshirtRangeMax('sm-lg')).toBe(false);
  expect.soft(isTshirtRangeMax('md')).toBe(false);
  expect.soft(isTshirtRangeMax('max-100xl', TSHIRT_TUPLE)).toBe(false);
});

test('isTshirtRange', () => {
  expect.soft(isTshirtRange('max-100xl')).toBe(true);
  expect.soft(isTshirtRange('max-md', TSHIRT_TUPLE)).toBe(true);
  expect.soft(isTshirtRange('min-md')).toBe(true);
  expect.soft(isTshirtRange('sm-lg')).toBe(true);
  expect.soft(isTshirtRange('md')).toBe(true);
  expect.soft(isTshirtRange('max-100xl', TSHIRT_TUPLE)).toBe(false);
  expect.soft(isTshirtRangeSimple('lg-sm')).toBe(false);
  expect.soft(isTshirtRange('')).toBe(false);
});
