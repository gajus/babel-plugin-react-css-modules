// @flow

import optionsDefaults from './schemas/optionsDefaults';

const attributeNameExists = (programPath: *, stats: *): boolean => {
  let exists = false;

  let attributeNames = optionsDefaults.attributeNames;

  if (stats.opts && stats.opts.attributeNames) {
    attributeNames = Object.assign({}, attributeNames, stats.opts.attributeNames);
  }

  programPath.traverse({
    JSXAttribute (attrPath: *) {
      if (exists) {
        return;
      }

      const attribute = attrPath.node;

      if (typeof attribute.name !== 'undefined' && typeof attributeNames[attribute.name.name] === 'string') {
        exists = true;
      }
    }
  });

  return exists;
};

export default attributeNameExists;
