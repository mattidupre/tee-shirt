import {
  type TshirtSizeToTuple,
  type TshirtSize,
  createTshirtTuple,
  parseTshirtSizes,
  type TshirtRecord,
  type TshirtSizeBounds,
} from './size.js';
import {
  isTshirtRangeMax,
  type TshirtRange,
  type TshirtRangeMax,
  type TshirtRangeMin,
  type TshirtRangeSimple,
  tshirtRangeToSizes,
} from './range.js';

/** Explicit range for no breakpoints. */
const NONE = 'none';

/** Explicit range for all breakpoints. */
const ALL = 'all';

/** Explicit size for width 0 to first breakpoint. */
const MIN = 'min';

/** Limit breakpoint bounds for performance. */
const ALL_BREAKPOINTS_BOUNDS = [
  '3xs',
  '3xl',
] as const satisfies TshirtSizeBounds;

const ALL_BREAKPOINT_SIZES = createTshirtTuple(ALL_BREAKPOINTS_BOUNDS);

export type TshirtBreakpoint<
  TBreakpoints extends TshirtBreakpoints = TshirtBreakpoints,
> = (typeof ALL_BREAKPOINT_SIZES)[number] & keyof TBreakpoints;

export type TshirtBreakpointBounds = [TshirtBreakpoint, TshirtBreakpoint];

/** The width of the respective breakpoint. Numbers are converted to px. */
export type TshirtBreakpointValue = number | string;

export type TshirtBreakpointRange<TBreakpoints extends TshirtBreakpoints> =
  | typeof ALL
  | typeof NONE
  | typeof MIN
  | keyof TBreakpoints
  | TshirtRangeMin<TshirtBreakpointsToSizeTuple<TBreakpoints>>
  | TshirtRangeMax<TshirtBreakpointsToSizeTuple<TBreakpoints>>
  | TshirtRangeSimple<TshirtBreakpointsToSizeTuple<TBreakpoints>>;

const parseBreakpointValue = (value: TshirtBreakpointValue) =>
  typeof value === 'number' ? `${value}px` : value;

const breakpointValueToQuery = (value: TshirtBreakpointValue) =>
  `(min-width: ${parseBreakpointValue(value)})`;

export type TshirtBreakpoints<TBounds extends TshirtBreakpointBounds = never> =
  [TBounds] extends [never]
    ? TshirtRecord<typeof ALL_BREAKPOINTS_BOUNDS, TshirtBreakpointValue>
    : Record<TshirtSize<TBounds>, TshirtBreakpointValue>;

export const defineTshirtBreakpoints = <T extends TshirtBreakpoints>(
  breakpoints: T,
) => breakpoints as Readonly<T>;

// TODO: Abstract and move to size.ts
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
  TReturn = any,
> = (
  size: TshirtBreakpoint<TBreakpoints>,
  value: TshirtBreakpoint<TBreakpoints>[keyof TshirtBreakpoint<TBreakpoints>],
) => TReturn;

export const mapTshirtBreakpoints = <
  TBreakpoints extends TshirtBreakpoints,
  TCallback extends TshirtBreakpointCallback<TBreakpoints>,
>(
  breakpoints: TBreakpoints,
  callback: TCallback,
) => {
  const result = [] as Array<ReturnType<TCallback>>;
  for (const breakpoint of tshirtBreakpointsToSizeTuple(breakpoints)) {
    result.push(
      callback(
        breakpoint as TshirtBreakpoint,
        breakpoints[breakpoint] as TshirtBreakpointValue,
      ),
    );
  }

  return result;
};

export const mapTshirtBreakpointsToObject = <
  TBreakpoints extends TshirtBreakpoints,
  TCallback extends TshirtBreakpointCallback<TBreakpoints>,
>(
  breakpoints: TBreakpoints,
  callback: TCallback,
) => {
  const result = {} as Record<
    TshirtBreakpoint<TBreakpoints>,
    ReturnType<TCallback>
  >;
  for (const breakpoint of tshirtBreakpointsToSizeTuple(breakpoints)) {
    (result as Record<string, unknown>)[breakpoint] = callback(
      breakpoint as TshirtBreakpoint,
      breakpoints[breakpoint] as TshirtBreakpointValue,
    );
  }

  return result;
};

export const tshirtBreakpointRangeToSizes = <
  TBreakpoints extends TshirtBreakpoints,
>(
  breakpoints: TBreakpoints,
  ...ranges: ReadonlyArray<TshirtBreakpointRange<TBreakpoints>>
) => {
  let hasMin = false;
  let hasAll = false;
  const parsedRanges = ranges.flatMap((range) => {
    if (range === ALL) {
      hasAll = true;
      return [];
    }

    if (range === NONE) {
      return [];
    }

    if (range === MIN) {
      hasMin = true;
      return [];
    }

    if (isTshirtRangeMax(range)) {
      hasMin = true;
    }

    return range;
  });

  if (hasAll) {
    return [MIN, ...tshirtBreakpointsToSizeTuple(breakpoints)];
  }

  return [
    ...(hasMin ? [MIN] : []),
    ...tshirtRangeToSizes(
      tshirtBreakpointsToSizeTuple(breakpoints),
      ...(parsedRanges as readonly TshirtRange[]),
    ),
  ] as ReadonlyArray<TshirtBreakpoint<TBreakpoints>>;
};

export const mapTshirtBreakpointsToCssQueries = <
  TBreakpoints extends TshirtBreakpoints,
>(
  breakpoints: TBreakpoints,
  callback: TshirtBreakpointCallback<TBreakpoints, void | string>,
) => {
  const sortedBreakpoints = tshirtBreakpointsToSizeTuple(breakpoints) as Array<
    TshirtBreakpoint<TBreakpoints>
  >;
  let css = '';
  for (const size of sortedBreakpoints) {
    const value = callback(size, breakpoints[size]!);
    if (!value) {
      continue;
    }

    const query = breakpointValueToQuery(breakpoints[size]!);
    css += `@media ${query} {${value}}\n`;
  }

  return css.trim();
};
