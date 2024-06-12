# Tee-Shirt

> A simple typesafe JavaScript utility to generate and parse Tshirt sizes and ranges. Useful for constructing scales and media query libraries.

Install from the [npm registry](https://www.npmjs.com/) with your package manager:
```bash
npm install tee-shirt
```

## Examples
```typescript
import {createTshirtSizes, tshirtRangesToSizes} from 'tee-shirt';

const SIZES = createTshirtSizes(3);
// => ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']

tshirtRangesToSizes(SIZES, ['xs-md'])
// => ['xs', 'sm', 'md']

tshirtRangesToSizes(SIZES, ['max-2xs', 'sm-lg', 'min-2xl'])
// => ['3xs', '2xs', 'sm', 'md', 'lg', '2xl', '3xl']
```

## TODO
- [ ] Change size min and max to reflect distance from medium.
      ```typescript:
        createTshirtSizes(0); // -> ['md']
        createTshirtSizes(1); // -> ['sm', 'md', 'lg']
        createTshirtSizes(3); // -> ['2xl', 'xl', 'sm', 'md', 'lg', 'xl', '2xl']
      ```
- [ ] Allow min and max to be set as range.
      ```typescript:
        createTshirtSizes('md'); // -> ['md']
        createTshirtSizes('sm', 'xl'); // -> ['sm', 'md', 'lg', 'xl']
        createTshirtSizes('lg', '3xl'); // -> ['lg', 'xl', '2xl', '3xl']
      ```
- [ ] Allow min and max to be set as non-numeric size.
      ```typescript:
        createTshirtSizes('xxs', 'xxl'); // -> ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl']
        createTshirtSizes('xx'); // -> ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl']
      ```
