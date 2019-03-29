"use strict";

require("./foo.css");

const rest = {};
<div {...rest} className={"b foo__a" + (" " + (rest ? rest.className || "" : ""))}></div>;
<div {...rest} className={"foo__a" + (" " + (rest ? rest.className || "" : ""))}></div>;
<div {...rest} activeClassName={((void 0).props.activeClassName ? (void 0).props.activeClassName + " " : "") + "foo__a" + (" " + (rest ? rest.activeClassName || "" : ""))} className={"foo__a" + (" " + (rest ? rest.className || "" : ""))}></div>;
<div {...rest} activeClassName={"b foo__a" + (" " + (rest ? rest.activeClassName || "" : ""))}></div>; // Should be okay if rest is put on last

<div className={"foo__a" + (" " + (rest ? rest.className || "" : ""))} {...rest}></div>;
const rest2 = {};
<div {...rest} {...rest2} className={"foo__a" + (" " + ((rest ? rest.className || "" : "") + (rest2 ? " " + (rest2.className || "") : "")))}></div>; // Should not do anything

<div {...rest} {...rest2}></div>;
<div {...rest} {...rest2} className="b"></div>;
<div className="foo__a">
  <div {...rest} activeClassName={"foo__a" + (" " + (rest ? rest.activeClassName || "" : ""))}></div>
</div>;
