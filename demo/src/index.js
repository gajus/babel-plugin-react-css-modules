import React from 'react';
import ReactDom from 'react-dom';
import AnonymouseStyleResolution from './components/AnonymouseStyleResolution';
import NamedStyleResolution from './components/NamedStyleResolution';
import RuntimeStyleResolution from './components/RuntimeStyleResolution';

ReactDom.render(<div>
  <AnonymouseStyleResolution />
  <NamedStyleResolution />
  <RuntimeStyleResolution />
</div>, document.getElementById('main'));
