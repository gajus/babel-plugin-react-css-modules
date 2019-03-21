import './foo.css';

const rest = {};

<div {...rest} styleName="a" className="b"></div>;

<div {...rest} styleName="a"></div>;

<div {...rest} activeClassName={this.props.activeClassName} activeStyleName="a" styleName="a"></div>;

<div {...rest} activeStyleName="a" activeClassName="b"></div>;

// Should be okay if rest is put on last
<div styleName="a" {...rest}></div>;

const rest2 = {};

<div {...rest} {...rest2} styleName="a"></div>;

// Should not do anything
<div {...rest} {...rest2}></div>;
<div {...rest} {...rest2} className="b"></div>;
