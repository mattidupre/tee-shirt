import {type TshirtSize} from './size.js';

export const mapTshirtsToObject = <
  TSizes extends readonly TshirtSize[],
  TCallback extends (size: TSizes[number]) => unknown,
>(
  sizes: TSizes,
  callback: TCallback,
) =>
  Object.fromEntries(sizes.map((size) => [size, callback(size)])) as Record<
    TSizes[number],
    ReturnType<TCallback>
  >;
