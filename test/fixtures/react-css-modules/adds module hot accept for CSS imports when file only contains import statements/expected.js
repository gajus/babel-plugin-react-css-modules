import './bar.css';

if (module.hot) {
  module.hot.accept('./bar.css', function () {
    require('./bar.css');
  });
}
