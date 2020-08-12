"use strict";

var _getClassName2 = _interopRequireDefault(require("@dr.pogodin/babel-plugin-react-css-modules/dist/browser/getClassName"));

require("./foo.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _styleModuleImportMap = {
  "./foo.css": {
    "a-b": "foo__a-b"
  }
};
const styleNameFoo = 'a-c';
<div className={(0, _getClassName2.default)(styleNameFoo, _styleModuleImportMap, {
  "handleMissingStyleName": "ignore"
})}></div>;
