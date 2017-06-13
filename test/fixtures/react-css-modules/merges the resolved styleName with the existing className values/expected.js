import _getClassName from 'babel-plugin-react-css-modules/dist/browser/getClassName';
import './bar.css';

const _styleModuleImportMap = {
  './bar.css': {
    'a': 'bar__a'
  }
};
<div className="apple banana bar__a"></div>;

<div className={(this.props.className ? this.props.className + ' ' : '') + 'bar__a'}></div>;

<div className={((Math.random() > 0.5 ? 'apple' : 'banana') ? (Math.random() > 0.5 ? 'apple' : 'banana') + ' ' : '') + 'bar__a'}></div>;

<div className={(this.props.className ? this.props.className + ' ' : '') + _getClassName(foo, _styleModuleImportMap)}></div>;
