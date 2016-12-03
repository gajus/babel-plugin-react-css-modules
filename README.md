# babel-plugin-react-css-modules

[![Travis build status](http://img.shields.io/travis/gajus/babel-plugin-react-css-modules/master.svg?style=flat-square)](https://travis-ci.org/gajus/babel-plugin-react-css-modules)
[![NPM version](http://img.shields.io/npm/v/babel-plugin-react-css-modules.svg?style=flat-square)](https://www.npmjs.org/package/babel-plugin-react-css-modules)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

<img src='./.README/babel-plugin-react-css-modules.png' height='150' />

Transforms `styleName` to `className` using compile time [CSS module](https://github.com/css-modules/css-modules) resolution.

In contrast to [`react-css-modules`](https://github.com/gajus/react-css-modules), `babel-plugin-react-css-modules` has a loot smaller performance overhead (0-10% vs +50%; see [Performance](#performance)) and a lot smaller size footprint (less than 2kb vs 17kb reaact-css-modules + lodash dependency).

* [Background](#background)
* [Performance](#performance)
* [How does it work?](#how-does-it-work)
* [Conventions](#conventions)
  * [Named reference](#named-reference)
* [Configuration](#configuration)
* [Example transpilations](#example-transpilations)
  * [Anonymous `styleName` resolution](#anonymous-stylename-resolution)
  * [Named `styleName` resolution](#named-stylename-resolution)
  * [Runtime `styleName` resolution](#runtime-stylename-resolution)
* [Limitations](#limitations)
* [Have a question or want to suggest an improvement?](#have-a-question-or-want-to-suggest-an-improvement)

## Background

[`react-css-modules`](https://github.com/gajus/react-css-modules) introduced a convention of using `styleName` attribute to reference [CSS module](https://github.com/css-modules/css-modules). `react-css-modules` is a higher-order [React](https://facebook.github.io/react/) component. It is using the `styleName` value to construct the `className` at the run-time. This abstraction frees a developer from needing to reference the imported styles object when using CSS modules ([What's the problem?](https://github.com/gajus/react-css-modules#whats-the-problem)). However, this approach has a measurable performance penalty at the cost of better developer experience (DX).

`babel-plugin-react-css-modules` solves the DX problem without impacting the performance.

## Performance

The important metric here is "Difference from base" (DFB). "base" is defined as using React with hardcoded `className` values. The lesser the DFB value, the bigger the performance impact.

> Note:
> This benchmark suite does not include a scenario when `babel-plugin-react-css-modules` can statically construct the value of `className`.
> If a literal value of the `className` is constructed at the compile time, the performance is equal to the base benchmark.

|Name|Operations per second (relative margin of error)|Sample size|Difference from the base benchmark|
|---|---|---|---|
|Using `className` (base)|8770 (±1.65)|529|-0%|
|`react-css-modules`|5268 (±1.91)|335|-66%|
|`babel-plugin-react-css-modules` (runtime, anonymous)|7915 (±2.07)|479|-10%|
|`babel-plugin-react-css-modules` (runtime, named)|8138 (±1.79)|504|-7%|

> Platform info:
>
> * Darwin 16.1.0 x64
> * Node.JS 7.1.0
> * V8 5.4.500.36
> * NODE_ENV=production
> * Intel(R) Core(TM) i7-4870HQ CPU @ 2.50GHz × 8

View the [./benchmark](./benchmark).

Run the benchmark:

```bash
git clone git@github.com:gajus/babel-plugin-react-css-modules.git
cd ./babel-plugin-react-css-modules
npm install
npm run build
cd ./benchmark
npm install
NODE_ENV=production ./test
```

## How does it work?

1. Builds index of all stylesheet imports per file.
1. Uses [postcss](https://github.com/postcss/postcss) to parse the matching CSS files.
1. Iterates through all [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) element declarations.
1. Uses the `styleName` value to resolve the generated CSS class name of the CSS module.
  * If `styleName` value is a string literal, generates a string literal value.
  * If `styleName` value is non-string (variable, condition, etc.), uses a helper function to construct `className` value at the runtime.
1. Removes the `styleName` attribute from the element.
1. Appends the resulting `className` to the existing `className` value (or creates `className` attribute if one does not exist).

## Configuration

|Name|Description|Default|
|---|---|---|
|`generateScopedName`|Refer to [Generating scoped names](https://github.com/css-modules/postcss-modules#generating-scoped-names)|N/A (delegates default resolution to [postcss-modules](https://github.com/css-modules/postcss-modules))|

Missing a configuration? [Raise an issue](https://github.com/gajus/babel-plugin-react-css-modules/issues/new?title=New%20configuration:).

## Conventions

### Named reference

Named reference is used to refer to a specific stylesheet import.

Format: `[name of the import].[CSS module name]`.

Example:

```js
import foo from './foo1.css';
import bar from './bar1.css';

// Imports "a" CSS module from ./foo1.css.
<div styleName="foo.a"></div>;

// Imports "a" CSS module from ./bar1.css.
<div styleName="bar.a"></div>;
```

## Example transpilations

### Anonymous `styleName` resolution

When `styleName` is a literal string value, `babel-plugin-react-css-modules` resolves the value of `className` at the compile time.

Input:

```js
import './bar.css';

<div styleName="a"></div>;

```

Output:

```js
import './bar.css';

<div className="bar___a"></div>;

```

### Named `styleName` resolution

When file imports multiple stylesheets, you must use a [named reference](#named-reference).

Input:

```js
import foo from './foo1.css';
import bar from './bar1.css';

<div styleName="foo.a"></div>;
<div styleName="bar.a"></div>;
```

Output:

```js
import foo from './bar.css';

<div className="bar___a"></div>;

```

### Runtime `styleName` resolution

When the value of `styleName` cannot be determined at the compile time, `babel-plugin-react-css-modules` inlines all possible styles into the file. It then uses `getClassName` helper function to resolve the `styleName` value at the runtime.

Input:

```js
import './bar.css';

<div styleName={Math.random() > .5 ? 'a' : 'b'}></div>;

```

Output:

```js
import _getClassName from 'babel-plugin-react-css-modules/dist/browser/getClassName';
import foo from './bar.css';

const _styleModuleImportMap = {
  foo: {
    a: 'bar__a',
    b: 'bar__b'
  }
};

<div styleName={_getClassName(Math.random() > .5 ? 'a' : 'b', _styleModuleImportMap)}></div>;

```

## Limitations

* [Establish a convention for extending the styles object at the runtime](https://github.com/gajus/babel-plugin-react-css-modules/issues/1)

## Have a question or want to suggest an improvement?

* Have a technical questions? [Ask on Stack Overflow.](http://stackoverflow.com/questions/ask?tags=babel-plugin-react-css-modules)
* Have a feature suggestion or want to report an issue? [Raise an issues.](https://github.com/gajus/babel-plugin-react-css-modules/issues)
* Want to say hello to other `babel-plugin-react-css-modules` users? [Chat on Gitter.](https://gitter.im/babel-plugin-react-css-modules)
