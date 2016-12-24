import _getClassName from 'babel-plugin-react-css-modules/dist/browser/getClassName';
import bar from './bar.css';
import './foo.css';

if (module.hot) {
  module.hot.accept('./bar.css', function () {
    require('./bar.css');
  });
}

if (module.hot) {
  module.hot.accept('./foo.css', function () {
    require('./foo.css');
  });
}

const _styleModuleImportMap = {
  'bar': {
    'a-b': 'bar__a-b'
  },
  'random-test': {
    'a-b': 'foo__a-b'
  }
};
const styleNameBar = 'bar.a-b';
const styleNameFoo = 'a-b';

<div className={_getClassName(styleNameBar, _styleModuleImportMap)}></div>;
<div className={'global ' + _getClassName(styleNameFoo, _styleModuleImportMap)}></div>;
