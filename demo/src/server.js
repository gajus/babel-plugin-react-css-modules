import { renderToString } from 'react-dom/server'
import React from 'react'
import AnonymouseStyleResolution from './components/AnonymouseStyleResolution'
import NamedStyleResolution from './components/NamedStyleResolution'
import RuntimeStyleResolution from './components/RuntimeStyleResolution'

console.log(renderToString(<div>
  <AnonymouseStyleResolution />
  <NamedStyleResolution />
  <RuntimeStyleResolution />
</div>))
