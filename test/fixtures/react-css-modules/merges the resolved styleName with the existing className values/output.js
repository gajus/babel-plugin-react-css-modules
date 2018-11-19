"use strict";

var _getClassName2 = _interopRequireDefault(require("babel-plugin-react-css-modules/dist/browser/getClassName"));

require("./bar.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _styleModuleImportMap = {
  "./bar.css": {
    "a": "bar__a"
  }
};
<div className="apple banana bar__a"></div>;
<div className={((void 0).props.className ? (void 0).props.className + " " : "") + "bar__a"}></div>;
<div className={((Math.random() > 0.5 ? 'apple' : 'banana') ? (Math.random() > 0.5 ? 'apple' : 'banana') + " " : "") + "bar__a"}></div>;
<div className={((void 0).props.className ? (void 0).props.className + " " : "") + (0, _getClassName2.default)(foo, _styleModuleImportMap)}></div>;
