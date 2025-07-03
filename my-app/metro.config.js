const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// NativeWind v4 configuration
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
