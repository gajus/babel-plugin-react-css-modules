"use strict";

require("./bar.css");

const props = {
  foo: 'bar'
};
<div className={"bar__a" + (" " + (props ? props.className || "" : ""))} {...props}></div>;
