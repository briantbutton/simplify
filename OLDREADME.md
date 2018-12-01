# Introduction

Consider a subset of boolean filter expressions (expressed as objects) consisting of `false`, `is`, `in`, `and` filters:

The `false` filter matches nothing

Example:

```
{ type: 'false' }
```

The `is` filter matches all data points where the given attribute is the given value

Example:

```
{ type: 'is', attribute: 'country', value: 'United States' }
```

The `in` filter matches all data points where the given attribute is one of the values in the supplied list

Example:

```
{ type: 'in', attribute: 'browser', values: ['Chrome' ,'Firefox', ...] }
```

The `and` filter matches if all of the sub filters match

Example:

```
{ type: 'and', filters: [<filter>, <filter>, <filter>, ...] }
```

A filter has the following properties:
- The `type` is one of 'false', 'is', 'in', 'and'
- The `attribute` is an arbitrary string that exists for type 'is' and 'in'
- The `value` is an arbitrary string that exists for type 'is'
- The `values` is an arbitrary string that exists for type 'in'
- The order of values in `in` expression is arbitrary (same logical meaning)
- The order of filters in `and` expressions is arbitrary (same logical meaning)

A filter is said to be simpler if:
  1. it is made up of less expressions, or...
  2. it is made up of simpler expressions, `false` is simpler than `is` which is simpler than `in` which is simpler than `and`.
  3. finally an `in` filter is simpler if it has less values.


# The Challenge

Fill in the function to simplify an arbitrary boolean filter expression composed of the statements above by editing the `src/simplify.js` file.
Feel free to use any language of your choice.
Write your code as if the function will become part of a larger project.
If you do not use node.js please include instructions for running your simplify function.

Your function should:
  1. Not modify the input filter in any way - the input filter might be used somewhere else
  2. Not change the logical meaning of the filter
  3. Simplify the filter as much as possible
  4. If given a malformed filter the behavior is undefined, an error would be nice

For more specific examples of simplifications please refer to the provided starter unit tests in `test/basic.js`.

Feel free to fill out `test/extra.js` as needed or to create your own test files.


## Running

If you have node installed you can run the tests with mocha using the following command:

```
npm install -d

node_modules/.bin/mocha test
```

The tests are provided as a guide, please feel free to use them as you wish.
Please note that the provided tests might fail despite you doing everything correctly as the order of the arrays in `in` and `and` filters are arbitrary.


## Submitting

Please zip your code and tests and send it back to us when you are done.
Please add a brief writeup of your approach, what alternative approaches you have considered and how you might improve the code in the future.
Please complete this challenge within 72 hours of receiving it.
