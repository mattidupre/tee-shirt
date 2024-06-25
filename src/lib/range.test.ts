import {expect, test} from 'vitest';
import {rangeToSizes} from './range.js';
import {createSizesArray} from './size.js';

test('rangeToSizes', () => {
  const SUBJECT = createSizesArray(['2xs', '2xl']);

  expect.soft(rangeToSizes(SUBJECT, 'max-2xs'))
    .toStrictEqual(['2xs']);
  expect.soft(rangeToSizes(SUBJECT, 'max-md'))
    .toStrictEqual(['2xs', 'xs', 'sm', 'md']);
  expect.soft(rangeToSizes(SUBJECT, 'min-2xl'))
    .toStrictEqual(['2xl']);
  expect.soft(rangeToSizes(SUBJECT, 'min-md'))
    .toStrictEqual(['md', 'lg', 'xl', '2xl']);
  expect.soft(rangeToSizes(SUBJECT, 'sm-lg'))
    .toStrictEqual(['sm', 'md', 'lg']);
});
