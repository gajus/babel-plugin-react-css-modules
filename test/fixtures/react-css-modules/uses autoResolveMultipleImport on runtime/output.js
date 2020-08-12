"use strict";

var _getClassName2 = _interopRequireDefault(require("@dr.pogodin/babel-plugin-react-css-modules/dist/browser/getClassName"));

require("./foo.css");

require("./bar.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _styleModuleImportMap = {
  "./foo.css": {
    "b": "foo__b"
  },
  "./bar.css": {
    "a": "bar__a"
  }
};
const styleNameA = 'a';
const styleNameB = 'b';
<div className={(0, _getClassName2.default)(styleNameA, _styleModuleImportMap, {
  "autoResolveMultipleImports": true,
  "handleMissingStyleName": "throw"
})}></div>;
<div className={(0, _getClassName2.default)(styleNameB, _styleModuleImportMap, {
  "autoResolveMultipleImports": true,
  "handleMissingStyleName": "throw"
})}></div>;
