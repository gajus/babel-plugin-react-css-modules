"use strict";

require("./bar.css");

if (module.hot) {
  module.hot.accept("./bar.css", function () {
    require("./bar.css");
  });
}

<div className="bar__a"></div>;
