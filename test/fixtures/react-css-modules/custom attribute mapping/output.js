"use strict";

var _getClassName2 = _interopRequireDefault(require("@dr.pogodin/babel-plugin-react-css-modules/dist/browser/getClassName"));

require("./foo.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _styleModuleImportMap = {
  "./foo.css": {
    "a": "foo__a"
  }
};
// Literal, no merging
<div activeClassName="foo__a" />; // Literal, merging with literal

<div activeClassName="apple banana foo__a"></div>; // Literal, merging with expression

<div activeClassName={((void 0).props.activeClassName ? (void 0).props.activeClassName + " " : "") + "foo__a"}></div>; // Literal, merging with complex expression

<div activeClassName={((Math.random() > 0.5 ? 'apple' : 'banana') ? (Math.random() > 0.5 ? 'apple' : 'banana') + " " : "") + "foo__a"}></div>; // Expression, no merging

<div activeClassName={(0, _getClassName2.default)(foo, _styleModuleImportMap)}></div>; // Expression, merging with expression

<div activeClassName={((void 0).props.activeClassName ? (void 0).props.activeClassName + " " : "") + (0, _getClassName2.default)(foo, _styleModuleImportMap)}></div>; // Multiple attributes

<div className="apple foo__a" activeClassName="foo__a" />;
