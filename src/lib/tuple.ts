export type TupleIndexOf<TTuple extends readonly unknown[], TValue extends TTuple[number]> =
  TTuple extends readonly [...infer THead, infer T]
    ? T extends TValue ? THead['length'] : TupleIndexOf<THead, TValue>
    : never;

/**
 * @private
 */
type SplitTuple<
  T,
  N extends number,
  O extends readonly any[] = [],
> = O['length'] extends N
  ? [O, T]
  : T extends readonly [infer F, ...infer R]
    ? SplitTuple<readonly [...R], N, readonly [...O, F]>
    : [O, T];

/**
 * Returns a new tuple beginning at provided index and optionally ending at provided index.
 */
export type SliceTuple<
  TTuple extends readonly any[],
  TStart extends number,
  TEnd extends number = TTuple['length'],
> = SplitTuple<SplitTuple<TTuple, TEnd>[0], TStart>[1];

/**
 * Returns a new tuple with values in reverse order.
 */
export type ReverseTuple<TTuple> = TTuple extends readonly [
  infer Head,
  ...infer Rest,
]
  ? [...ReverseTuple<Rest>, Head]
  : [];

/**
 * Converts a tuple to readonly.
 */
export type ReadonlyTuple<T> = T extends readonly [...infer F]
  ? readonly [...F]
  : T extends [...infer F]
    ? readonly [...F]
    : never;

/**
 * Converts a tuple to writable.
 */
export type WritableTuple<T> = T extends readonly [...infer F]
  ? [...F]
  : T extends [...infer F]
    ? [...F]
    : never;

/**
 * Appends provided value to the end of every stringish tuple value.
 */
export type SuffixTupleValues<
  TTuple,
  TSuffix extends string | number | bigint,
> = TTuple extends readonly [...any[]]
  ? {
    [K in keyof TTuple]: TTuple[K] extends number | string | bigint
      ? `${TTuple[K]}${TSuffix}`
      : TTuple[K];
  }
  : never;

/**
 * Prepends provided value to the beginning of every stringish tuple value.
 */
export type PrefixTupleValues<
  TTuple,
  TPrefix extends string | number | bigint,
> = TTuple extends readonly [...any[]]
  ? {
    [K in keyof TTuple]: TTuple[K] extends number | string | bigint
      ? `${TPrefix}${TTuple[K]}`
      : TTuple[K];
  }
  : never;

/**
 * Like keyof but uses actual numeric tuple indexes if possible.
 */
export type TupleKey<
  TTuple extends readonly unknown[],
  TKeys extends readonly number[] = [],
> = TTuple extends [infer _, ...infer R]
  ? TupleKey<R, [R['length'], ...TKeys]>
  : TKeys[number];

/**
 * Like valueof but better handles index inference.
 */
export type TupleValue<T extends readonly unknown[]> = T[TupleKey<T>];
