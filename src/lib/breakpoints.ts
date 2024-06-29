import {
  type TshirtBreakpoints,
  type TshirtBreakpointsToSizeTuple,
} from './query.js';
import {
  isTshirtRangeMax,
  tshirtRangeToSizes,
  type TshirtRange,
} from './range.js';
import {
  type TshirtSizeToTuple,
  type TshirtSizeBounds,
  createTshirtTuple,
  type TshirtRecord,
} from './size.js';
import {lazy, mapArrayToObject} from './utils.js';

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

type BreakpointsObjectAny = Partial<
  Record<(typeof ALL_BREAKPOINT_SIZES)[number], string | number>
>;

export type BreakpointsObject = TshirtRecord<
  typeof ALL_BREAKPOINTS_BOUNDS,
  BreakpointValue
>;

type BreakpointSize<T extends BreakpointsObjectAny> = Extract<
  keyof T,
  keyof BreakpointsObjectAny
>;

type BreakpointSizeWithMin<T extends BreakpointsObjectAny> =
  | typeof MIN
  | BreakpointSize<T>;

type BreakpointSizes<T extends BreakpointsObjectAny> = TshirtSizeToTuple<
  typeof ALL_BREAKPOINT_SIZES,
  BreakpointSize<T>
>;

type BreakpointSizesWithMin<T extends BreakpointsObjectAny> = [
  typeof MIN,
  ...BreakpointSizes<T>,
];

type BreakpointCallback<T extends BreakpointsObjectAny, TReturns = unknown> = (
  size: BreakpointSize<T>,
  value: undefined | BreakpointValue<T>,
) => TReturns;

type BreakpointCallbackWithMin<
  T extends BreakpointsObjectAny,
  TReturns = unknown,
> = (
  size: typeof MIN | BreakpointSize<T>,
  value: undefined | BreakpointValue<T>,
) => TReturns;

type BreakpointQueryCallback<T extends BreakpointsObjectAny> = (
  size: typeof MIN | BreakpointSize<T>,
) => undefined | string;

export type BreakpointValue<
  T extends BreakpointsObjectAny = BreakpointsObjectAny,
> = NonNullable<T[keyof T]>;

export type TshirtBreakpointRange<TBreakpoints extends TshirtBreakpoints> =
  TshirtRange<TshirtBreakpointsToSizeTuple<TBreakpoints>>;

type Options = {
  prefix?: string;
};

export class Breakpoints<TBreakpoints extends BreakpointsObject> {
  sizesTuple: BreakpointSizes<TBreakpoints>;
  sizes: ReadonlyArray<BreakpointSize<TBreakpoints>>;
  sizesWithMin: BreakpointSizesWithMin<TBreakpoints>;

  constructor(
    readonly breakpoints: TBreakpoints,
    readonly options: Options = {},
  ) {
    this.sizes = Object.keys(breakpoints) as Array<
      BreakpointSize<TBreakpoints>
    >;
    this.sizesTuple = this.sizes as typeof this.sizesTuple;
    this.sizesWithMin = [MIN, ...this.sizesTuple];

    for (const size of this.sizes) {
      if (!(ALL_BREAKPOINT_SIZES as string[]).includes(size)) {
        // TODO: Specific error if valid size but out of range.
        throw new TypeError(`Invalid breakpoint size "${size}".`);
      }
    }
  }

  getValue(
    size: typeof MIN | BreakpointSize<TBreakpoints>,
  ): undefined | BreakpointValue<TBreakpoints> {
    if (size === MIN) {
      return undefined;
    }

    const value = this.breakpoints[size]!;
    return value;
  }

  getWidth(
    size: typeof MIN | BreakpointSize<TBreakpoints>,
  ): undefined | string {
    const value = this.getValue(size)!;
    return value && String(value) + 'px';
  }

  getSizes(...ranges: ReadonlyArray<TshirtBreakpointRange<TBreakpoints>>) {
    if (ranges.length === 0) {
      return [...this.sizesWithMin];
    }

    let isMax = false;
    for (const range of ranges) {
      if (isTshirtRangeMax(range)) {
        isMax = true;
      }

      if (range === 'all') {
        return [...this.sizesWithMin];
      }
    }

    const sizes = tshirtRangeToSizes(this.sizesTuple, ...ranges);

    return (isMax ? [MIN, ...sizes] : sizes) as Array<
      BreakpointSizeWithMin<TBreakpoints>
    >;
  }

  mapToArray<T extends BreakpointCallback<TBreakpoints>>(callback: T) {
    return this.sizes.map((size) => callback(size, this.getValue(size)));
  }

  mapToObject<T extends BreakpointCallback<TBreakpoints>>(callback: T) {
    return mapArrayToObject(this.sizes, (size) =>
      callback(size, this.getValue(size)),
    );
  }

  toCssQueries(
    prefix: string,
    callback: BreakpointQueryCallback<TBreakpoints>,
  ) {
    let css = '';
    for (const size of this.sizesWithMin) {
      const width = this.getWidth(size);
      const value = callback(size);
      if (!value) {
        continue;
      }

      if (css) {
        css += '\n';
      }

      css +=
        size === MIN ? value : `${prefix} (min-width: ${width}) {${value}}`;
    }

    return css;
  }

  toCssMediaQueries(callback: BreakpointQueryCallback<TBreakpoints>) {
    return this.toCssQueries('@media', callback);
  }

  // TODO: toCssContainerQueries

  @lazy
  get cssBinaryVariables() {
    const {prefix} = this.options;
    return mapArrayToObject(
      this.sizesWithMin,
      (size) => `--${prefix ? `${prefix}-` : ''}${size as string}` as const,
    );
  }

  @lazy
  get cssBinaryMediaQueries() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const binaryEntries = Object.entries(this.cssBinaryVariables) as Array<
      [string, string]
    >;
    return this.toCssMediaQueries((size) => {
      return (
        '\n' +
        binaryEntries
          .map(([binarySize, binaryVariable]) => {
            const value = size === binarySize ? 1 : 0;
            const padding = size === 'min' ? '' : '  ';
            return `${padding}:root { ${binaryVariable}: ${value} }`;
          })
          .join('\n') +
        '\n'
      );
    });
  }

  getBinaryValue(
    ...ranges: ReadonlyArray<TshirtBreakpointRange<TBreakpoints>>
  ) {
    const sizes = this.getSizes(...ranges);
    if (sizes.length === 0) {
      return '0';
    }

    let binaryValue = '';
    for (const size of sizes) {
      const separator = binaryValue ? '+' : '';
      binaryValue += `${separator}var(${this.cssBinaryVariables[size]})`;
    }

    return `calc(${binaryValue})`;
  }
}
