import {
  type TshirtSizeToTuple,
  type TshirtSize,
  createTshirtTuple,
  parseTshirtSizes,
  type TshirtRecord,
  type TshirtSizeBounds,
} from './size.js';
import {type TshirtRange, tshirtRangeToSizes} from './range.js';

const ALL_BREAKPOINTS_BOUNDS = [
  '2xs',
  '2xl',
] as const satisfies TshirtSizeBounds;

const ALL_BREAKPOINT_SIZES = createTshirtTuple(ALL_BREAKPOINTS_BOUNDS);

export type TshirtBreakpointSizeAny = (typeof ALL_BREAKPOINT_SIZES)[number];

export type TshirtBreakpointBounds = [
  TshirtBreakpointSizeAny,
  TshirtBreakpointSizeAny,
];

export type TshirtBreakpointValue = number | string;

export type TshirtBreakpointRange<TBreakpoints extends TshirtBreakpoints> =
  TshirtRange<TshirtBreakpointsToSizeTuple<TBreakpoints>>;

export type TshirtBreakpointsToSize<
  TBreakpoints extends TshirtBreakpoints = never,
> = [TBreakpoints] extends [never]
  ? keyof TshirtBreakpoints
  : keyof TBreakpoints;

const parseBreakpointValue = (value: TshirtBreakpointValue) =>
  typeof value === 'number' ? `${value}px` : value;

const breakpointValueToQuery = (
  value: TshirtBreakpointValue,
  type: 'min' | 'max',
) => `(${type}-width: ${parseBreakpointValue(value)})`;

const createCssVariable = (size: string, prefix?: string) =>
  `--${prefix ? `${prefix}-` : ''}${size}` as const;

export type TshirtBreakpoints<TBounds extends TshirtBreakpointBounds = never> =
  [TBounds] extends [never]
    ? TshirtRecord<typeof ALL_BREAKPOINTS_BOUNDS, TshirtBreakpointValue>
    : Record<TshirtSize<TBounds>, TshirtBreakpointValue>;

export const defineTshirtBreakpoints = <T extends TshirtBreakpoints>(
  breakpoints: T,
) => breakpoints as Readonly<T>;

export type TshirtBreakpointsToSizeTuple<
  TBreakpoints extends TshirtBreakpoints = never,
> = [TBreakpoints] extends [never]
  ? typeof ALL_BREAKPOINT_SIZES
  : keyof TBreakpoints extends TshirtSize
    ? TshirtSizeToTuple<typeof ALL_BREAKPOINT_SIZES, keyof TBreakpoints>
    : never;

export const tshirtBreakpointsToSizeTuple = <
  TBreakpoints extends TshirtBreakpoints,
>(
  breakpoints: TBreakpoints,
) =>
  parseTshirtSizes(
    ALL_BREAKPOINT_SIZES,
    Object.keys(breakpoints) as ReadonlyArray<TshirtSize & keyof TBreakpoints>,
  );

export type TshirtBreakpointCallback<
  TBreakpoints extends TshirtBreakpoints = never,
> = (
  size: TshirtBreakpointsToSize<TBreakpoints>,
  value: TshirtBreakpointValue,
) => undefined | string;

export const tshirtBreakpointRangeToSizes = <
  TBreakpoints extends TshirtBreakpoints,
>(
  breakpoints: TBreakpoints,
  ...ranges: ReadonlyArray<TshirtBreakpointRange<TBreakpoints>>
) =>
  tshirtRangeToSizes(
    tshirtBreakpointsToSizeTuple(breakpoints),
    ...(ranges as readonly TshirtRange[]),
  ) as ReadonlyArray<keyof TBreakpoints>;

export const mapTshirtBreakpointsToCss = <
  TBreakpoints extends TshirtBreakpoints,
>(
  breakpoints: TBreakpoints,
  type: 'min' | 'max',
  callback: TshirtBreakpointCallback<TBreakpoints>,
) =>
  Object.entries(breakpoints)
    .flatMap(([size, breakpoint]) => {
      if (breakpoint === undefined) {
        return [];
      }

      const value = (callback as TshirtBreakpointCallback)(
        size as TshirtBreakpointSizeAny,
        breakpoint as TshirtBreakpointSizeAny,
      );
      if (!value) {
        return [];
      }

      return `@media ${breakpointValueToQuery(breakpoint as TshirtBreakpointSizeAny, type)} {${value}}`;
    })
    .join('\n');

export const tshirtBreakpointsToCssVariables = <
  TBreakpoints extends TshirtBreakpoints,
>(
  breakpoints: TBreakpoints,
  prefix: string,
) =>
  Object.fromEntries(
    ['min', ...Object.keys(breakpoints)].map((breakpointSize) => [
      breakpointSize,
      createCssVariable(breakpointSize as TshirtBreakpointSizeAny, prefix),
    ]),
  ) as Record<'min' | keyof TshirtBreakpoints, `--${string}`>;

export const tshirtBreakpointsToCss = (
  breakpoints: TshirtBreakpoints,
  prefix: string,
) => {
  const cssVariables = tshirtBreakpointsToCssVariables(breakpoints, prefix);
  const toValue = (currentSize: keyof typeof cssVariables) =>
    '\n:root {\n' +
    Object.keys(cssVariables)
      .map(
        (thisSize) =>
          `\t${cssVariables[thisSize]}: ${currentSize === thisSize ? 1 : 0};`,
      )
      .join('\n') +
    '\n}\n';
  return (
    toValue('min') +
    mapTshirtBreakpointsToCss(breakpoints, 'min', (size) => toValue(size))
  );
};

export const tshirtBreakpointRangeToInline = <
  TBreakpoints extends TshirtBreakpoints,
>(
  breakpoints: TBreakpoints,
  prefix: string,
  range: TshirtBreakpointRange<TBreakpoints>,
) => {
  throw new Error('Here');
};
