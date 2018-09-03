import React from 'react';
import ReactDom from 'react-dom';
import AnonymousStyleResolution from './components/AnonymousStyleResolution';
import NamedStyleResolution from './components/NamedStyleResolution';
import RuntimeStyleResolution from './components/RuntimeStyleResolution';

ReactDom.render(<div>
  <AnonymousStyleResolution />
  <NamedStyleResolution />
  <RuntimeStyleResolution />
</div>, document.getElementById('main'));
