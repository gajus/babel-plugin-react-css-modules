import _getClassName from 'babel-plugin-react-css-modules/dist/browser/getClassName';
import './bar.css';

const _styleModuleImportMap = {
  './bar.css': {
    'a': 'bar__a'
  }
};
<div className="bar__a apple banana"></div>;

<div className={'bar__a' + (this.props.className ? ' ' + this.props.className : '')}></div>;

<div className={'bar__a' + ((Math.random() > 0.5 ? 'apple' : 'banana') ? ' ' + (Math.random() > 0.5 ? 'apple' : 'banana') : '')}></div>;

<div className={_getClassName(foo, _styleModuleImportMap) + (this.props.className ? ' ' + this.props.className : '')}></div>;
