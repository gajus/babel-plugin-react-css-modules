// @flow

import optionsDefaults from './schemas/optionsDefaults';

const attributeNameExists = (path: *, stats: *): boolean => {
  const programPath = path.findParent((parentPath) => {
    return parentPath.isProgram();
  });

  let exists = false;

  programPath.traverse({
    JSXElement (jSXpath: *) {
      if (exists) {
        return;
      }

      let attributeNames = optionsDefaults.attributeNames;

      if (stats.opts && stats.opts.attributeNames) {
        attributeNames = Object.assign({}, attributeNames, stats.opts.attributeNames);
      }

      const attributes = jSXpath.node.openingElement.attributes
        .filter((attribute) => {
          return typeof attribute.name !== 'undefined' && typeof attributeNames[attribute.name.name] === 'string';
        });

      if (attributes.length) {
        exists = true;
      }
    }
  });

  return exists;
};

export default attributeNameExists;
