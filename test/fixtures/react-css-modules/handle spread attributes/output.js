"use strict";

require("./foo.css");

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const rest = {};
<div {..._objectWithoutProperties(rest, ["styleName", "className", "activeStyleName", "activeClassName"])} className={"b foo__a" + (" " + rest.className)}></div>;
<div {..._objectWithoutProperties(rest, ["styleName", "className", "activeStyleName", "activeClassName"])} className={"foo__a" + (" " + rest.className)}></div>;
<div {..._objectWithoutProperties(rest, ["styleName", "className", "activeStyleName", "activeClassName"])} activeClassName={((void 0).props.activeClassName ? (void 0).props.activeClassName + " " : "") + "foo__a" + (" " + rest.activeClassName)} className={"foo__a" + (" " + rest.className)}></div>;
<div {..._objectWithoutProperties(rest, ["styleName", "className", "activeStyleName", "activeClassName"])} activeClassName={"apple banana foo__a" + (" " + rest.activeClassName)}></div>; // Should be okay if rest is put on last

<div className={"foo__a" + (" " + rest.className)} {..._objectWithoutProperties(rest, ["styleName", "className", "activeStyleName", "activeClassName"])}></div>;
const rest2 = {};
<div {..._objectWithoutProperties(rest, ["styleName", "className", "activeStyleName", "activeClassName"])} {..._objectWithoutProperties(rest2, ["styleName", "className", "activeStyleName", "activeClassName"])} className={"foo__a" + (" " + (rest.className + (" " + rest2.className)))}></div>;
<div {...rest} {...rest2}></div>;
