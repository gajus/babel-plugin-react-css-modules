// @flow

export default (sourceFilePath: string, filetypes: $ReadOnlyArray<string>): ?string => {
  // Try to match as the RegExp pattern
  for (const pattern of filetypes) {
    if (pattern.match(/^\.[a-z0-9A-Z]+?$/)) {
      continue;
    }
    if (sourceFilePath.match(new RegExp(pattern))) {
      return pattern;
    }
  }

  const extensionDotIndex = sourceFilePath.lastIndexOf('.');

  if (extensionDotIndex > -1) {
    const extension = sourceFilePath.substr(extensionDotIndex);
    const index = filetypes.indexOf(extension);

    if (index > -1) {
      return filetypes[index];
    }
  }

  return null;
};
