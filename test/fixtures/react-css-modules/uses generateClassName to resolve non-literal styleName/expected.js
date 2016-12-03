import _getClassName from 'babel-plugin-react-css-modules/dist/browser/getClassName';
import foo from './bar.css';

const _styleModuleImportMap = {
  foo: {
    a: 'bar__a'
  }
};
const styleNameValue = 'a';

<div styleName={_getClassName(styleNameValue, _styleModuleImportMap)}></div>;
