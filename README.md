# babel-plugin-react-css-modules

[![Travis build status](http://img.shields.io/travis/gajus/babel-plugin-react-css-modules/master.svg?style=flat-square)](https://travis-ci.org/gajus/babel-plugin-react-css-modules)
[![NPM version](http://img.shields.io/npm/v/babel-plugin-react-css-modules.svg?style=flat-square)](https://www.npmjs.org/package/babel-plugin-react-css-modules)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Gitter](https://img.shields.io/gitter/room/babel-plugin-react-css-modules/Lobby.svg?style=flat-square)](https://gitter.im/babel-plugin-react-css-modules/Lobby)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

<img src='./.README/babel-plugin-react-css-modules.png' height='150' />

Transforms `styleName` to `className` using compile time [CSS module](#css-modules) resolution.

In contrast to [`react-css-modules`](https://github.com/gajus/react-css-modules), `babel-plugin-react-css-modules` has a lot smaller performance overhead (0-10% vs +50%; see [Performance](#performance)) and a lot smaller size footprint (less than 2kb vs 17kb react-css-modules + lodash dependency).

* [CSS Modules](#css-modules)
* [Difference from `react-css-modules`](#difference-from-react-css-modules)
* [Performance](#performance)
* [How does it work?](#how-does-it-work)
* [Conventions](#conventions)
  * [Anonymous reference](#anonymous-reference)
  * [Named reference](#named-reference)
* [Configuration](#configuration)
* [Installation](#installation)
* [Example transpilations](#example-transpilations)
  * [Anonymous `styleName` resolution](#anonymous-stylename-resolution)
  * [Named `styleName` resolution](#named-stylename-resolution)
  * [Runtime `styleName` resolution](#runtime-stylename-resolution)
* [Limitations](#limitations)
* [Have a question or want to suggest an improvement?](#have-a-question-or-want-to-suggest-an-improvement)

## CSS Modules

[CSS Modules](https://github.com/css-modules/css-modules) are awesome! If you are not familiar with CSS Modules, it is a concept of using a module bundler such as [webpack](http://webpack.github.io/docs/) to load CSS scoped to a particular document. CSS module loader will generate a unique name for each CSS class at the time of loading the CSS document ([Interoperable CSS](https://github.com/css-modules/icss) to be precise). To see CSS Modules in practice, [webpack-demo](https://css-modules.github.io/webpack-demo/).

In the context of React, CSS Modules look like this:

```js
import React from 'react';
import styles from './table.css';

export default class Table extends React.Component {
  render () {
    return <div className={styles.table}>
      <div className={styles.row}>
        <div className={styles.cell}>A0</div>
        <div className={styles.cell}>B0</div>
      </div>
    </div>;
  }
}

```

Rendering the component will produce a markup similar to:

```js
<div class="table__table___32osj">
  <div class="table__row___2w27N">
    <div class="table__cell___1oVw5">A0</div>
    <div class="table__cell___1oVw5">B0</div>
  </div>
</div>

```

and a corresponding CSS file that matches those CSS classes.

Awesome!

However, there are several several disadvantages of using CSS modules this way:

* You have to use `camelCase` CSS class names.
* You have to use `styles` object whenever constructing a `className`.
* Mixing CSS Modules and global CSS classes is cumbersome.
* Reference to an undefined CSS Module resolves to `undefined` without a warning.

`babel-plugin-react-css-modules` automates loading of CSS Modules using `styleName` property, e.g.

```js
import React from 'react';
import './table.css';

export default class Table extends React.Component {
  render () {
    return <div styleName='table'>
      <div styleName='row'>
        <div styleName='cell'>A0</div>
        <div styleName='cell'>B0</div>
      </div>
    </div>;
  }
}

```

Using `babel-plugin-react-css-modules`:

* You are not forced to use the `camelCase` naming convention.
* You do not need to refer to the `styles` object every time you use a CSS Module.
* There is clear distinction between global CSS and CSS modules, e.g.

  ```js
  <div className='global-css' styleName='local-module'></div>
  ```

<!--
* You are warned when `styleName` refers to an undefined CSS Module ([`errorWhenNotFound`](#errorwhennotfound) option).
* You can enforce use of a single CSS module per `ReactElement` ([`allowMultiple`](#allowmultiple) option).
-->

## Difference from `react-css-modules`

[`react-css-modules`](https://github.com/gajus/react-css-modules) introduced a convention of using `styleName` attribute to reference [CSS module](https://github.com/css-modules/css-modules). `react-css-modules` is a higher-order [React](https://facebook.github.io/react/) component. It is using the `styleName` value to construct the `className` value at the run-time. This abstraction frees a developer from needing to reference the imported styles object when using CSS modules ([What's the problem?](https://github.com/gajus/react-css-modules#whats-the-problem)). However, this approach has a measurable performance penalty (see [Performance](#performance)).

`babel-plugin-react-css-modules` solves the developer experience problem without impacting the performance.

## Performance

The important metric here is the "Difference from the base benchmark". "base" is defined as using React with hardcoded `className` values. The lesser the difference, the bigger the performance impact.

> Note:
> This benchmark suite does not include a scenario when `babel-plugin-react-css-modules` can statically construct a literal value at the build time.
> If a literal value of the `className` is constructed at the compile time, the performance is equal to the base benchmark.

|Name|Operations per second (relative margin of error)|Sample size|Difference from the base benchmark|
|---|---|---|---|
|Using `className` (base)|9551 (±1.47%)|587|-0%|
|`react-css-modules`|5914 (±2.01%)|363|-61%|
|`babel-plugin-react-css-modules` (runtime, anonymous)|9145 (±1.94%)|540|-4%|
|`babel-plugin-react-css-modules` (runtime, named)|8786 (±1.59%)|527|-8%|

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

1. Builds index of all stylesheet imports per file (imports of files with `.css` or `.scss` extension).
1. Uses [postcss](https://github.com/postcss/postcss) to parse the matching CSS files.
1. Iterates through all [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) element declarations.
1. Parses the `styleName` attribute value into anonymous and named CSS module references.
1. Finds the CSS class name matching the CSS module reference:
  * If `styleName` value is a string literal, generates a string literal value.
  * If `styleName` value is a [`jSXExpressionContainer`](https://github.com/babel/babel/tree/master/packages/babel-types#jsxexpressioncontainer), uses a helper function ([`getClassName`](./src/getClassName.js)) to construct the `className` value at the runtime.
1. Removes the `styleName` attribute from the element.
1. Appends the resulting `className` to the existing `className` value (creates `className` attribute if one does not exist).

## Configuration

|Name|Description|Default|
|---|---|---|
|`generateScopedName`|Refer to [Generating scoped names](https://github.com/css-modules/postcss-modules#generating-scoped-names)|`[path]___[name]__[local]___[hash:base64:5]`|
|`context`|Must match webpack [`context`](https://webpack.github.io/docs/configuration.html#context) configuration. [`css-loader`](https://github.com/webpack/css-loader) inherits `context` values from webpack. Other CSS module implementations might use different context resolution logic.|`process.cwd()`|

Missing a configuration? [Raise an issue](https://github.com/gajus/babel-plugin-react-css-modules/issues/new?title=New%20configuration:).

> Note:
> The default configuration should work out of the box with the [css-loader](https://github.com/webpack/css-loader).

## Installation

When `babel-plugin-react-css-modules` cannot resolve CSS module at a compile time, it imports a helper function (read [Runtime `styleName` resolution](#runtime-stylename-resolution)). Therefore, you must install `babel-plugin-react-css-modules` as a direct dependency of the project.

```bash
npm install babel-plugin-react-css-modules --save
```

## Conventions

### Anonymous reference

Anonymous reference can be used when there is only one stylesheet import.

Format: `CSS module name`.

Example:

```js
import './foo1.css';

// Imports "a" CSS module from ./foo1.css.
<div styleName="a"></div>;
```

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

When a file imports multiple stylesheets, you must use a [named reference](#named-reference).

> Have suggestions for an alternative behaviour?
> [Raise an issue](https://github.com/gajus/babel-plugin-react-css-modules/issues/new?title=Suggestion%20for%20alternative%20handling%20of%20multiple%20stylesheet%20imports) with your suggestion.

Input:

```js
import foo from './foo1.css';
import bar from './bar1.css';

<div styleName="foo.a"></div>;
<div styleName="bar.a"></div>;
```

Output:

```js
import foo from './foo1.css';
import bar from './bar1.css';

<div className="foo___a"></div>;
<div className="bar___a"></div>;

```

### Runtime `styleName` resolution

When the value of `styleName` cannot be determined at the compile time, `babel-plugin-react-css-modules` inlines all possible styles into the file. It then uses [`getClassName`](https://github.com/gajus/babel-plugin-react-css-modules/blob/master/src/getClassName.js) helper function to resolve the `styleName` value at the runtime.

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
