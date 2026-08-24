const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const config = getDefaultConfig(projectRoot);

// The mobile and website forms share the same static country-code dataset.
config.watchFolders = [workspaceRoot];

module.exports = config;
