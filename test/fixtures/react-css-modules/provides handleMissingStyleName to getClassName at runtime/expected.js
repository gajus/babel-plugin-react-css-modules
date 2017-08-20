import _getClassName from 'babel-plugin-react-css-modules/dist/browser/getClassName';
import './foo.css';

const _styleModuleImportMap = {
  './foo.css': {
    'a-b': 'foo__a-b'
  }
};
const styleNameFoo = 'a-c';

<div className={_getClassName(styleNameFoo, _styleModuleImportMap, {
  'handleMissingStyleName': 'ignore'
})}></div>;
