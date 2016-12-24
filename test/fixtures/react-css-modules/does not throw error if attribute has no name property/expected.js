import './bar.css';

if (module.hot) {
  module.hot.accept('./bar.css', function () {
    require('./bar.css');
  });
}

const props = {
  foo: 'bar'
};

<div className="bar__a" {...props}></div>;
