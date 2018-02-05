import _getClassName from 'babel-plugin-react-css-modules/dist/browser/getClassName';
import './foo.css';

// Literal, no merging
const _styleModuleImportMap = {
  './foo.css': {
    'a': 'foo__a'
  }
};
<div activeClassName="foo__a" />;

// Literal, merging with literal
<div activeClassName="apple banana foo__a"></div>;

// Literal, merging with expression
<div activeClassName={(this.props.activeClassName ? this.props.activeClassName + ' ' : '') + 'foo__a'}></div>;

// Literal, merging with complex expression
<div activeClassName={((Math.random() > 0.5 ? 'apple' : 'banana') ? (Math.random() > 0.5 ? 'apple' : 'banana') + ' ' : '') + 'foo__a'}></div>;

// Expression, no merging
<div activeClassName={_getClassName(foo, _styleModuleImportMap)}></div>;

// Expression, merging with expression
<div activeClassName={(this.props.activeClassName ? this.props.activeClassName + ' ' : '') + _getClassName(foo, _styleModuleImportMap)}></div>;

// Multiple attributes
<div className="apple foo__a" activeClassName="foo__a" />;
