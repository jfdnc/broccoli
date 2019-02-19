'use strict';

const path = require('path');
const findup = require('findup-sync');
const esmRequire = require('esm')(module);

module.exports = function loadBrocfile(options) {
  if (!options) {
    options = {};
  }

  let brocfilePath;
  let file = 'Brocfile.js';

  if (options.brocfilePath) {
    file = options.brocfilePath;
    brocfilePath = path.resolve(options.brocfilePath);
  } else if (options.ts) {
    file = 'Brocfile.ts';
    brocfilePath = findup(file, {
      nocase: true,
    });
  } else {
    brocfilePath = findup(file, {
      nocase: true,
    });
  }

  if (!brocfilePath) {
    throw new Error(`${file} not found`);
  }

  const baseDir = options.cwd || path.dirname(brocfilePath)

  // Load typescript loader
  if (options.ts || brocfilePath.match(/\.ts/)) {
    const configPath = findup(`${baseDir}/tsconfig.json`, {
      nocase: true,
    });

    const options = configPath ? { project: configPath } : {};
    require('ts-node').register(options);
  }

  // The chdir should perhaps live somewhere else and not be a side effect of
  // this function, or go away entirely
  process.chdir(baseDir);

  // Load brocfile
  let brocfile = esmRequire(brocfilePath);

  // ESM `export default X` is represented as module.exports = { default: X }
  if (brocfile !== null && typeof brocfile === 'object' && brocfile.hasOwnProperty('default')) {
    brocfile = brocfile.default;
  }

  // Brocfile should export a function, if it did, return now
  if (typeof brocfile === 'function') {
    return brocfile;
  }

  // Wrap brocfile result in a function for backwards compatibility
  return () => brocfile;
};
