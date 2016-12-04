/* eslint-disable import/no-commonjs, class-methods-use-this */

const os = require('os');
const Benchmark = require('benchmark');
const React = require('react');
const ReactDomServer = require('react-dom/server');
const ReactCssModulesComponent = require('react-css-modules');
const getClassName = require('../dist/browser/getClassName').default;

const minSamples = 100;

// eslint-disable-next-line no-process-env
if (process.env.NODE_ENV !== 'production') {
  throw new Error('Unexpected NODE_ENV.');
}

/**
 * @see https://github.com/petkaantonov/bluebird/blob/4ec337233c1fa7bb4eb90473222014f16d074e58/benchmark/performance.js#L11
 */
const printPlatform = () => {
  const v8 = process.versions.v8;
  const node = process.versions.node;

  // eslint-disable-next-line no-process-env
  const plat = os.type() + ' ' + os.release() + ' ' + os.arch() + '\nNode.JS ' + node + '\nV8 ' + v8 + '\nNODE_ENV=' + process.env.NODE_ENV;

  let cpus = os.cpus()
    .map((cpu) => {
      return cpu.model;
    })
    .reduce((o, model) => {
      if (!o[model]) {
        o[model] = 0;
      }

      o[model]++;

      return o;
    }, {});

  cpus = Object
    .keys(cpus)
    .map((key) => {
      return key + ' \u00d7 ' + cpus[key];
    })
    .join('\n');

  // eslint-disable-next-line no-console
  console.log('\nPlatform info:\n' + plat + '\n' + cpus + '\n');
};

const suite = new Benchmark.Suite();

suite.add('Using `className` (base)', () => {
  const SubjectComponent = React.createClass({
    render () {
      return React.createElement(
        'div',
        {
          className: 'foo'
        },
        React.createElement('div', {
          className: 'bar'
        }),
        React.createElement('div', {
          className: 'bar'
        }),
        React.createElement('div', {
          className: 'bar'
        })
      );
    }
  });

  ReactDomServer.renderToStaticMarkup(React.createElement(SubjectComponent));
}, {
  minSamples
});

suite.add('`react-css-modules`', () => {
  let SubjectComponent;

  SubjectComponent = React.createClass({
    render () {
      return React.createElement(
        'div',
        {
          styleName: 'foo'
        },
        React.createElement('div', {
          styleName: 'bar'
        }),
        React.createElement('div', {
          styleName: 'bar'
        }),
        React.createElement('div', {
          styleName: 'bar'
        })
      );
    }
  });

  SubjectComponent = ReactCssModulesComponent(SubjectComponent, {
    bar: 'b',
    foo: 'a'
  });

  ReactDomServer.renderToStaticMarkup(React.createElement(SubjectComponent));
}, {
  minSamples
});

suite.add('`babel-plugin-react-css-modules` (runtime, anonymous)', () => {
  const styleModuleImportMap = {
    anonymous: {
      bar: 'b',
      foo: 'a'
    }
  };

  const SubjectComponent = React.createClass({
    render () {
      return React.createElement(
        'div',
        {
          className: getClassName('foo', styleModuleImportMap)
        },
        React.createElement('div', {
          className: getClassName('bar', styleModuleImportMap)
        }),
        React.createElement('div', {
          className: getClassName('bar', styleModuleImportMap)
        }),
        React.createElement('div', {
          className: getClassName('bar', styleModuleImportMap)
        })
      );
    }
  });

  ReactDomServer.renderToStaticMarkup(React.createElement(SubjectComponent));
}, {
  minSamples
});

suite.add('`babel-plugin-react-css-modules` (runtime, named)', () => {
  const styleModuleImportMap = {
    qux: {
      bar: 'b',
      foo: 'a'
    }
  };

  const SubjectComponent = React.createClass({
    render () {
      return React.createElement(
        'div',
        {
          className: getClassName('qux.foo', styleModuleImportMap)
        },
        React.createElement('div', {
          className: getClassName('qux.bar', styleModuleImportMap)
        }),
        React.createElement('div', {
          className: getClassName('qux.bar', styleModuleImportMap)
        }),
        React.createElement('div', {
          className: getClassName('qux.bar', styleModuleImportMap)
        })
      );
    }
  });

  ReactDomServer.renderToStaticMarkup(React.createElement(SubjectComponent));
}, {
  minSamples
});

const results = [];

suite
  .on('error', (error) => {
    // eslint-disable-next-line no-console
    console.log('error', error);

    throw new Error('An unexpected error has occurred.');
  })
  .on('cycle', (event) => {
    results.push(event.target);
  })
  .on('complete', () => {
    const table = [];

    table.push('|Name|Operations per second (relative margin of error)|Sample size|Difference from the base benchmark|');
    table.push('|---|---|---|---|');

    let base;

    for (const benchmark of results) {
      if (!base) {
        base = benchmark;
      }

      table.push('|' + benchmark.name + '|' + Math.floor(benchmark.hz) + ' (±' + benchmark.stats.rme.toFixed(2) + '%)|' + benchmark.count + '|-' + Math.floor(((base.hz - benchmark.hz) / benchmark.hz) * 100) + '%|');
    }

    // eslint-disable-next-line no-console
    console.log(table.join('\n'));

    printPlatform();
  });

suite.run();
