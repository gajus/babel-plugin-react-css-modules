"use strict";

var _getClassName2 = _interopRequireDefault(require("babel-plugin-react-css-modules/dist/browser/getClassName"));

var _bar = _interopRequireDefault(require("./bar.css"));

require("./foo.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _styleModuleImportMap = {
  "bar": {
    "a-b": "bar__a-b"
  },
  "./foo.css": {
    "a-b": "foo__a-b"
  }
};
const styleNameBar = 'bar.a-b';
const styleNameFoo = 'a-b';
<div className={(0, _getClassName2.default)(styleNameBar, _styleModuleImportMap)}></div>;
<div className={(0, _getClassName2.default)(styleNameFoo, _styleModuleImportMap)}></div>;
