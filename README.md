# babel-plugin-react-css-modules

[![GitSpo Mentions](https://gitspo.com/badges/mentions/gajus/babel-plugin-react-css-modules?style=flat-square)](https://gitspo.com/mentions/gajus/babel-plugin-react-css-modules)
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
  * [Configurate syntax loaders](#configurate-syntax-loaders)
  * [Custom Attribute Mapping](#custom-attribute-mapping)
* [Installation](#installation)
  * [React Native](#react-native)
  * [Demo](#demo)
* [Example transpilations](#example-transpilations)
  * [Anonymous `styleName` resolution](#anonymous-stylename-resolution)
  * [Named `styleName` resolution](#named-stylename-resolution)
  * [Runtime `styleName` resolution](#runtime-stylename-resolution)
* [Limitations](#limitations)
* [Have a question or want to suggest an improvement?](#have-a-question-or-want-to-suggest-an-improvement)
* [FAQ](#faq)
  * [How to migrate from react-css-modules to babel-plugin-react-css-modules?](#how-to-migrate-from-react-css-modules-to-babel-plugin-react-css-modules)
  * [How to reference multiple CSS modules?](#how-to-reference-multiple-css-modules)
  * [How to live reload the CSS?](#hot-to-live-reload-the-css)

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

However, there are several disadvantages of using CSS modules this way:

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
    * If `styleName` value is a [`jSXExpressionContainer`](https://babeljs.io/docs/en/next/babel-types.html#jsxexpressioncontainer), uses a helper function ([`getClassName`](./src/getClassName.js)) to construct the `className` value at the runtime.
1. Removes the `styleName` attribute from the element.
1. Appends the resulting `className` to the existing `className` value (creates `className` attribute if one does not exist).

## Configuration

Configure the options for the plugin within your `.babelrc` as follows:

```json
{
  "plugins": [
    ["react-css-modules", {
      "option": "value"
    }]
  ]
}

```

### Options

|Name|Type|Description|Default|
|---|---|---|---|
|`context`|`string`|Must match webpack [`context`](https://webpack.js.org/configuration/entry-context/#context) configuration. [`css-loader`](https://github.com/webpack/css-loader) inherits `context` values from webpack. Other CSS module implementations might use different context resolution logic.|`process.cwd()`|
|`exclude`|`string`|A RegExp that will exclude otherwise included files e.g., to exclude all styles from node_modules `exclude: 'node_modules'`|
|`filetypes`|`?FiletypesConfigurationType`|Configure [postcss syntax loaders](https://github.com/postcss/postcss#syntaxes) like sugarss, LESS and SCSS and extra plugins for them. ||
|`generateScopedName`|`?GenerateScopedNameConfigurationType`|Refer to [Generating scoped names](https://github.com/css-modules/postcss-modules#generating-scoped-names). If you use this option, make sure it matches the value of `localIdentName` in webpack config. See this [issue](https://github.com/gajus/babel-plugin-react-css-modules/issues/108#issuecomment-334351241) |`[path]___[name]__[local]___[hash:base64:5]`|
|`removeImport`|`boolean`|Remove the matching style import. This option is used to enable server-side rendering.|`false`|
|`webpackHotModuleReloading`|`boolean`|Enables hot reloading of CSS in webpack|`false`|
|`handleMissingStyleName`|`"throw"`, `"warn"`, `"ignore"`|Determines what should be done for undefined CSS modules (using a `styleName` for which there is no CSS module defined).  Setting this option to `"ignore"` is equivalent to setting `errorWhenNotFound: false` in [react-css-modules](https://github.com/gajus/react-css-modules#errorwhennotfound). |`"throw"`|
|`attributeNames`|`?AttributeNameMapType`|Refer to [Custom Attribute Mapping](#custom-attribute-mapping)|`{"styleName": "className"}`|
|`skip`|`boolean`|Whether to apply plugin if no matching `attributeNames` found in the file|`false`|
|`autoResolveMultipleImports`|`boolean`|Allow multiple anonymous imports if `styleName` is only in one of them.|`false`|

Missing a configuration? [Raise an issue](https://github.com/gajus/babel-plugin-react-css-modules/issues/new?title=New%20configuration:).

> Note:
> The default configuration should work out of the box with the [css-loader](https://github.com/webpack/css-loader).

#### Option types (flow)

```js
type FiletypeOptionsType = {|
  +syntax: string,
  +plugins?: $ReadOnlyArray<string | $ReadOnlyArray<[string, mixed]>>
|};

type FiletypesConfigurationType = {
  [key: string]: FiletypeOptionsType
};

type GenerateScopedNameType = (localName: string, resourcePath: string) => string;

type GenerateScopedNameConfigurationType = GenerateScopedNameType | string;

type AttributeNameMapType = {
  [key: string]: string
};

```

### Configurate syntax loaders

To add support for different CSS syntaxes (e.g. SCSS), perform the following two steps:

1. Add the [postcss syntax loader](https://github.com/postcss/postcss#syntaxes) as a development dependency:

  ```bash
  npm install postcss-scss --save-dev
  ```

2. Add a filetype syntax mapping to the Babel plugin configuration

  ```json
  "filetypes": {
    ".scss": {
      "syntax": "postcss-scss"
    }
  }
  ```

  And optionaly specify extra plugins

  ```json
  "filetypes": {
    ".scss": {
      "syntax": "postcss-scss",
      "plugins": [
        "postcss-nested"
      ]
    }
  }
  ```

  Postcss plugins can have options specified by wrapping the name and an options object in an array inside your config

  ```json
    "plugins": [
      ["postcss-import-sync2", {
        "path": ["src/styles", "shared/styles"]
      }],
      "postcss-nested"
    ]
  ```


### Custom Attribute Mapping

You can set your own attribute mapping rules using the `attributeNames` option.

It's an object, where keys are source attribute names and values are destination attribute names.

For example, the [&lt;NavLink&gt;](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/NavLink.md) component from [React Router](https://github.com/ReactTraining/react-router) has a `activeClassName` attribute to accept an additional class name. You can set `"attributeNames": { "activeStyleName": "activeClassName" }` to transform it.

The default `styleName` -> `className` transformation **will not** be affected by an `attributeNames` value without a `styleName` key. Of course you can use `{ "styleName": "somethingOther" }` to change it, or use `{ "styleName": null }` to disable it.

## Installation

When `babel-plugin-react-css-modules` cannot resolve CSS module at a compile time, it imports a helper function (read [Runtime `styleName` resolution](#runtime-stylename-resolution)). Therefore, you must install `babel-plugin-react-css-modules` as a direct dependency of the project.

```bash
npm install babel-plugin-react-css-modules --save
```


### React Native

If you'd like to get this working in React Native, you're going to have to allow custom import extensions, via a `rn-cli.config.js` file:

```js
module.exports = {
  getAssetExts() {
    return ["scss"];
  }
}
```

Remember, also, that the bundler caches things like plugins and presets. If you want to change your `.babelrc` (to add this plugin) then you'll want to add the `--reset-cache` flag to the end of the package command.

### Demo

```bash
git clone git@github.com:gajus/babel-plugin-react-css-modules.git
cd ./babel-plugin-react-css-modules/demo
npm install
npm start
```

```bash
open http://localhost:8080/
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

## FAQ

### How to migrate from react-css-modules to babel-plugin-react-css-modules?

Follow the following steps:

* Remove `react-css-modules`.
* Add `babel-plugin-react-css-modules`.
* Configure `.babelrc` (see [Configuration](#configuration)).
* Remove all uses of the `cssModules` decorator and/or HoC.

If you are still having problems, refer to one of the user submitted guides:

* [Porting from react-css-modules to babel-plugin-react-css-modules (with Less)](http://www.jjinux.com/2018/04/javascript-porting-from-react-css.html)

### How to reference multiple CSS modules?

`react-css-modules` had an option [`allowMultiple`](https://github.com/gajus/react-css-modules#allowmultiple). `allowMultiple` allows multiple CSS module names in a `styleName` declaration, e.g.

```js
<div styleName='foo bar' />
```

This behaviour is enabled by default in `babel-plugin-react-css-modules`.

### How to live reload the CSS?

`babel-plugin-react-css-modules` utilises webpack [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/#root) (HMR) to live reload the CSS.

To enable live reloading of the CSS:

* Enable [`webpackHotModuleReloading`](#configuration) `babel-plugin-react-css-modules` configuration.
* Configure `webpack` to use HMR. Use [`--hot`](https://webpack.js.org/configuration/dev-server/#root) option if you are using `webpack-dev-server`.
* Use [`style-loader`](https://github.com/webpack/style-loader) to load the style sheets.

> Note:
>
> This enables live reloading of the CSS. To enable HMR of the React components, refer to the [Hot Module Replacement - React](https://webpack.js.org/guides/hot-module-replacement/#other-code-and-frameworks) guide.

> Note:
>
> This is a [webpack](https://webpack.github.io/) specific option. If you are using `babel-plugin-react-css-modules` in a different setup and require CSS live reloading, raise an issue describing your setup.
