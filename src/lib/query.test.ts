import {expect, test} from 'vitest';
import {
  mapTshirtBreakpointsToCss,
  tshirtBreakpointRangeToInline,
  tshirtBreakpointRangeToSizes,
  tshirtBreakpointsToCss,
  tshirtBreakpointsToSizeTuple,
  type TshirtBreakpoints,
} from './query.js';

// eslint-disable-next-line unicorn/prefer-string-replace-all
const trimInside = (string: string) => string.replace(/\s+/g, ' ').trim();

const MOCK_BREAKPOINTS = {
  sm: 640,
  md: 1024,
  lg: 1280,
} as const satisfies TshirtBreakpoints<['sm', 'lg']>;

const MOCK_PREFIX = 'mock';

test('mapTshirtBreakpointsToCss', () => {
  expect
    .soft(
      mapTshirtBreakpointsToCss(MOCK_BREAKPOINTS, 'min', (...arguments_) =>
        String(arguments_),
      ),
    )
    .toStrictEqual(
      [
        '@media (min-width: 640px) {sm,640}',
        '@media (min-width: 1024px) {md,1024}',
        '@media (min-width: 1280px) {lg,1280}',
      ].join('\n'),
    );
  expect
    .soft(
      mapTshirtBreakpointsToCss(MOCK_BREAKPOINTS, 'max', (...arguments_) =>
        String(arguments_),
      ),
    )
    .toStrictEqual(
      [
        '@media (max-width: 640px) {sm,640}',
        '@media (max-width: 1024px) {md,1024}',
        '@media (max-width: 1280px) {lg,1280}',
      ].join('\n'),
    );
});

test('tshirtBreakpointsToSizeTuple', () => {
  expect
    .soft(tshirtBreakpointsToSizeTuple(MOCK_BREAKPOINTS))
    .toStrictEqual(['sm', 'md', 'lg']);
});

test('tshirtBreakpointRangeToSizes', () => {
  expect
    .soft(tshirtBreakpointRangeToSizes(MOCK_BREAKPOINTS, 'min-md'))
    .toStrictEqual(['md', 'lg']);
  expect
    .soft(tshirtBreakpointRangeToSizes(MOCK_BREAKPOINTS, 'max-md'))
    .toStrictEqual(['sm', 'md']);
});

test('tshirtBreakpointsToCss', () => {
  expect
    .soft(trimInside(tshirtBreakpointsToCss(MOCK_BREAKPOINTS, MOCK_PREFIX)))
    .toEqual(
      trimInside(`
:root {
  --mock-min: 1;
  --mock-sm: 0;
  --mock-md: 0;
  --mock-lg: 0;
}
@media (min-width: 640px) {
  :root {
    --mock-min: 0;
    --mock-sm: 1;
    --mock-md: 0;
    --mock-lg: 0;
  }
}
@media (min-width: 1024px) {
  :root {
    --mock-min: 0;
    --mock-sm: 0;
    --mock-md: 1;
    --mock-lg: 0;
  }
}
@media (min-width: 1280px) {
  :root {
    --mock-min: 0;
    --mock-sm: 0;
    --mock-md: 0;
    --mock-lg: 1;
  }
}
`),
    );
});

test('tshirtBreakpointRangeToInline', () => {
  expect
    .soft(tshirtBreakpointRangeToInline(MOCK_BREAKPOINTS, MOCK_PREFIX, 'sm-lg'))
    .toEqual('');
});
