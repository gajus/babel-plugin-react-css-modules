import './bar.css';

<div className='apple banana' styleName="a"></div>;

<div className={this.props.className} styleName="a"></div>;

<div className={Math.random() > 0.5 ? 'apple' : 'banana'} styleName="a"></div>;

<div className={this.props.className} styleName={foo}></div>;
