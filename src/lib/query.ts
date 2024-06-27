import {
  type TshirtSizeToTuple, type TshirtSize, createTshirtTuple, parseTshirtSizes, type TshirtRecord,
  type TshirtSizeBounds,
} from './size.js';
import {type TshirtRange, tshirtRangeToSizes} from './range.js';

const ALL_BREAKPOINTS_BOUNDS = ['2xs', '2xl'] as const satisfies TshirtSizeBounds;

const ALL_BREAKPOINT_SIZES = createTshirtTuple(ALL_BREAKPOINTS_BOUNDS);

type BreakpointSizeAny = typeof ALL_BREAKPOINT_SIZES[number];

type BreakpointBounds = [BreakpointSizeAny, BreakpointSizeAny];

type BreakpointValue = number | string;

const parseBreakpointValue = (value: BreakpointValue) => typeof value === 'number' ? `${value}px` : value;

export type TshirtBreakpoints<TBounds extends BreakpointBounds = never> =
  [TBounds] extends [never] ? TshirtRecord<typeof ALL_BREAKPOINTS_BOUNDS, BreakpointValue> :
    Record<TshirtSize<TBounds>, BreakpointValue>;

export const defineTshirtBreakpoints = <T extends TshirtBreakpoints>(breakpoints: T) => breakpoints as Readonly<T>;

export type TshirtBreakpointsToSize<TBreakpoints extends TshirtBreakpoints = never> = [TBreakpoints] extends [never] ? keyof TshirtBreakpoints : keyof TBreakpoints;

export type TshirtBreakpointsToSizeTuple<TBreakpoints extends TshirtBreakpoints = never> = [TBreakpoints] extends [never] ? typeof ALL_BREAKPOINT_SIZES : keyof TBreakpoints extends TshirtSize ? TshirtSizeToTuple<typeof ALL_BREAKPOINT_SIZES, keyof TBreakpoints> : never;

export const tshirtBreakpointsToSizeTuple = <TBreakpoints extends TshirtBreakpoints>(breakpoints: TBreakpoints) =>
  parseTshirtSizes(ALL_BREAKPOINT_SIZES, Object.keys(breakpoints) as ReadonlyArray<TshirtSize & keyof TBreakpoints>);

export type BreakpointRange<TBreakpoints extends TshirtBreakpoints> = TshirtRange<TshirtBreakpointsToSizeTuple<TBreakpoints>>;

export type TshirtBreakpointCallback<TBreakpoints extends TshirtBreakpoints = never> =
  (size: TshirtBreakpointsToSize<TBreakpoints>, value: BreakpointValue) => undefined | string;

export const tshirtBreakpointRangeToSizes = <TBreakpoints extends TshirtBreakpoints>(breakpoints: TBreakpoints, ...ranges: ReadonlyArray<BreakpointRange<TBreakpoints>>) =>
  tshirtRangeToSizes(tshirtBreakpointsToSizeTuple(breakpoints), ...ranges as readonly TshirtRange[]) as ReadonlyArray<keyof TBreakpoints>;

const breakpointValueToQuery = (value: BreakpointValue, type: 'min' | 'max') => `(${type}-width: ${parseBreakpointValue(value)})`;

export const mapTshirtBreakpointsToCss
  = <TBreakpoints extends TshirtBreakpoints>(breakpoints: TBreakpoints, type: 'min' | 'max', callback: TshirtBreakpointCallback<TBreakpoints>) =>
    Object.entries(breakpoints).flatMap(([size, breakpoint]) => {
      if (breakpoint === undefined) {
        return [];
      }

      const value = (callback as TshirtBreakpointCallback)(size as BreakpointSizeAny, breakpoint as BreakpointSizeAny);
      if (!value) {
        return [];
      }

      return `@media ${breakpointValueToQuery(breakpoint as BreakpointSizeAny, type)} {${value}}`;
    }).join('\n');

const createCssVariable = (size: string, prefix?: string) => `--${prefix ? `${prefix}-` : ''}${size}` as const;

export const tshirtBreakpointsToCssVariables = <TBreakpoints extends TshirtBreakpoints>(breakpoints: TBreakpoints, prefix: string) =>
  Object.fromEntries(['default', ...Object.keys(breakpoints)].map(breakpointSize => [breakpointSize, createCssVariable(breakpointSize as BreakpointSizeAny, prefix)])) as Record<'default' | keyof TshirtBreakpoints, `--${string}`>;

export const tshirtBreakpointsToCss = (breakpoints: TshirtBreakpoints, prefix: string) => {
  const cssVariables = tshirtBreakpointsToCssVariables(breakpoints, prefix);
  const toValue = (currentSize: keyof typeof cssVariables) =>
    '\n:root {\n' + Object.keys(cssVariables).map(thisSize => `\t${cssVariables[thisSize]}: ${currentSize === thisSize ? 1 : 0};`).join('\n') + '\n}\n';
  return toValue('default') + mapTshirtBreakpointsToCss(breakpoints, 'min', size =>
    toValue(size),
  );
};

export const tshirtBreakpointRangeToInline = <TBreakpoints extends TshirtBreakpoints>(breakpoints: TBreakpoints, prefix: string, range: BreakpointRange<TBreakpoints>) => {
  throw new Error('Here');
};
