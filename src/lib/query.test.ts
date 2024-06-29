import {
  mapTshirtBreakpointsToCssQueries,
  tshirtBreakpointRangeToSizes,
  tshirtBreakpointsToSizeTuple,
  type TshirtBreakpoints,
} from './query.js';
import {trimInside} from './utils.js';

const MOCK_BREAKPOINTS = {
  sm: 640,
  md: 1024,
  lg: 1280,
} as const satisfies TshirtBreakpoints<['sm', 'lg']>;

const MOCK_PREFIX = 'mock';

test('mapTshirtBreakpointsToCssQueries', () => {
  expect
    .soft(
      trimInside(
        mapTshirtBreakpointsToCssQueries(MOCK_BREAKPOINTS, (...arguments_) =>
          String(arguments_),
        ),
      ),
    )
    .toStrictEqual(
      trimInside(`
        @media (min-width: 640px) {sm,640}
        @media (min-width: 1024px) {md,1024}
        @media (min-width: 1280px) {lg,1280}
      `),
    );
});

test('tshirtBreakpointsToSizeTuple', () => {
  expect
    .soft(tshirtBreakpointsToSizeTuple(MOCK_BREAKPOINTS))
    .toStrictEqual(['sm', 'md', 'lg']);
});

test('tshirtBreakpointRangeToSizes', () => {
  expect
    .soft(tshirtBreakpointRangeToSizes(MOCK_BREAKPOINTS, 'sm-lg'))
    .toStrictEqual(['sm', 'md', 'lg']);
  expect
    .soft(tshirtBreakpointRangeToSizes(MOCK_BREAKPOINTS, 'sm-lg', 'all'))
    .toStrictEqual(['min', ...Object.keys(MOCK_BREAKPOINTS)]);
  expect
    .soft(tshirtBreakpointRangeToSizes(MOCK_BREAKPOINTS, 'max-md'))
    .toStrictEqual(['min', 'sm', 'md']);
  expect
    .soft(tshirtBreakpointRangeToSizes(MOCK_BREAKPOINTS, 'min-md'))
    .toStrictEqual(['md', 'lg']);
  expect
    .soft(tshirtBreakpointRangeToSizes(MOCK_BREAKPOINTS, 'min', 'sm', 'lg'))
    .toStrictEqual(['min', 'sm', 'lg']);
});
