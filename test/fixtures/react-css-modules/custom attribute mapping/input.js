import './foo.css';

// Literal, no merging
<div activeStyleName="a" />;

// Literal, merging with literal
<div activeClassName='apple banana' activeStyleName="a"></div>;

// Literal, merging with expression
<div activeClassName={this.props.activeClassName} activeStyleName="a"></div>;

// Literal, merging with complex expression
<div activeClassName={Math.random() > 0.5 ? 'apple' : 'banana'} activeStyleName="a"></div>;

// Expression, no merging
<div activeStyleName={foo}></div>;

// Expression, merging with expression
<div activeClassName={this.props.activeClassName} activeStyleName={foo}></div>;

// Multiple attributes
<div className="apple" styleName="a" activeStyleName="a" />;
