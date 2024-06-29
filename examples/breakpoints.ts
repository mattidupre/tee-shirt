import {
  type TshirtBreakpoint,
  type TshirtBreakpointRange,
  tshirtBreakpointRangeToSizes,
  type TshirtBreakpointBounds,
  type TshirtBreakpoints,
  mapTshirtBreakpointsToCssQueries,
  type TshirtBreakpointCallback,
  mapTshirtBreakpointsToObject,
  tshirtBreakpointsToSizeTuple,
  mapTshirtBreakpoints,
} from 'tee-shirt';

const BOUNDS = ['sm', '2xl'] as const satisfies TshirtBreakpointBounds;

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const satisfies TshirtBreakpoints<typeof BOUNDS>;

type Breakpoints = typeof BREAKPOINTS;

type Breakpoint = TshirtBreakpoint<Breakpoints>;

type BreakpointRange = TshirtBreakpointRange<Breakpoints>;

const getBreakpoints = (
  ...ranges: ReadonlyArray<TshirtBreakpointRange<Breakpoints>>
) => tshirtBreakpointRangeToSizes(BREAKPOINTS, ...ranges);

expect(getBreakpoints('sm-lg')).toStrictEqual(['sm', 'md', 'lg']);

expect(getBreakpoints('max-md')).toStrictEqual(['min', 'sm', 'md']);

expect(getBreakpoints('min-md')).toStrictEqual(['md', 'lg', 'xl', '2xl']);

expect(getBreakpoints('all')).toStrictEqual([
  'min',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
]);

expect(getBreakpoints('none')).toStrictEqual([]);

const mapBreakpointsToObject = (
  callback: TshirtBreakpointCallback<Breakpoints>,
) => mapTshirtBreakpointsToObject(BREAKPOINTS, callback);

const BINARY_VARS = mapBreakpointsToObject(
  (breakpoint) => `--binary-${breakpoint}`,
);

const mapBreakpoints = (callback: TshirtBreakpointCallback<Breakpoints>) =>
  mapTshirtBreakpoints(BREAKPOINTS, callback);

const rootVariable = (breakpoint: Breakpoint, value: 0 | 1) =>
  `:root { ${BINARY_VARS[breakpoint]}: ${value}; }`;

const CSS = [
  ...mapBreakpoints(rootVariable),
  ...mapBreakpoints(
    (breakpoint, value) =>
      `@media (min-width: ${value}px) { ${rootVariable(breakpoint, 1)} }`,
  ),
].join('\n');

const binaryValue = (...ranges: BreakpointRange[]) =>
  `calc(${Object.values(BINARY_VARS)
    .map((variableName) => `var(${variableName})`)
    .join('+')})`;

expect(binaryValue('all')).toBe(
  'calc(var(--binary-sm)+var(--binary-md)+var(--binary-lg)+var(--binary-xl)+var(--binary-2xl))',
);
