import {Breakpoints, type BreakpointsObject} from './breakpoints.js';
import {trimInside} from './utils.js';

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const satisfies BreakpointsObject;

let breakpoints: InstanceType<typeof Breakpoints<typeof BREAKPOINTS>>;
beforeEach(() => {
  breakpoints = new Breakpoints(BREAKPOINTS, {prefix: 'test'});
});

test('breakpoints.sizes', () => {
  expect
    .soft(breakpoints.sizesTuple)
    .toStrictEqual(['sm', 'md', 'lg', 'xl', '2xl']);
});

test('breakpoints.getValue', () => {
  expect.soft(breakpoints.getValue('md')).toBe(768);
});

test('breakpoints.getSizes', () => {
  expect
    .soft(breakpoints.getSizes('max-md'))
    .toStrictEqual(['min', 'sm', 'md']);
});

test('breakpoints.mapToObject', () => {
  expect
    .soft(breakpoints.mapToObject((...arguments_) => arguments_))
    .toStrictEqual({
      sm: ['sm', 640],
      md: ['md', 768],
      lg: ['lg', 1024],
      xl: ['xl', 1280],
      '2xl': ['2xl', 1536],
    });
});

test('breakpoints.mapToArray', () => {
  expect
    .soft(breakpoints.mapToArray((...arguments_) => arguments_))
    .toStrictEqual([
      ['sm', 640],
      ['md', 768],
      ['lg', 1024],
      ['xl', 1280],
      ['2xl', 1536],
    ]);
});

test('breakpoints.toCssMediaQueries', () => {
  expect
    .soft(
      trimInside(
        breakpoints.toCssMediaQueries((...arguments_) => String(arguments_)),
      ),
    )
    .toBe(
      trimInside(`
        min
        @media (min-width: 640px) {sm}
        @media (min-width: 768px) {md}
        @media (min-width: 1024px) {lg}
        @media (min-width: 1280px) {xl}
        @media (min-width: 1536px) {2xl}
      `),
    );
});

test('breakpoints.cssBinaryVariables', () => {
  expect(breakpoints.cssBinaryVariables).toStrictEqual({
    min: '--test-min',
    sm: '--test-sm',
    md: '--test-md',
    lg: '--test-lg',
    xl: '--test-xl',
    '2xl': '--test-2xl',
  });
});

test('breakpoints.cssBinaryMediaQueries', () => {
  expect(trimInside(breakpoints.cssBinaryMediaQueries)).toStrictEqual(
    trimInside(`
      :root { --test-min: 1 }
      :root { --test-sm: 0 }
      :root { --test-md: 0 }
      :root { --test-lg: 0 }
      :root { --test-xl: 0 }
      :root { --test-2xl: 0 }

      @media (min-width: 640px) {
        :root { --test-min: 0 }
        :root { --test-sm: 1 }
        :root { --test-md: 0 }
        :root { --test-lg: 0 }
        :root { --test-xl: 0 }
        :root { --test-2xl: 0 }
      }
      @media (min-width: 768px) {
        :root { --test-min: 0 }
        :root { --test-sm: 0 }
        :root { --test-md: 1 }
        :root { --test-lg: 0 }
        :root { --test-xl: 0 }
        :root { --test-2xl: 0 }
      }
      @media (min-width: 1024px) {
        :root { --test-min: 0 }
        :root { --test-sm: 0 }
        :root { --test-md: 0 }
        :root { --test-lg: 1 }
        :root { --test-xl: 0 }
        :root { --test-2xl: 0 }
      }
      @media (min-width: 1280px) {
        :root { --test-min: 0 }
        :root { --test-sm: 0 }
        :root { --test-md: 0 }
        :root { --test-lg: 0 }
        :root { --test-xl: 1 }
        :root { --test-2xl: 0 }
      }
      @media (min-width: 1536px) {
        :root { --test-min: 0 }
        :root { --test-sm: 0 }
        :root { --test-md: 0 }
        :root { --test-lg: 0 }
        :root { --test-xl: 0 }
        :root { --test-2xl: 1 }
      }
   `),
  );
});

test('breakpoints.getBinaryValue', () => {
  expect.soft(trimInside(breakpoints.getBinaryValue('all'))).toBe(
    trimInside(`
      calc(${[
        'var(--test-min)',
        'var(--test-sm)',
        'var(--test-md)',
        'var(--test-lg)',
        'var(--test-xl)',
        'var(--test-2xl)',
      ].join('+')})
      `),
  );
});
