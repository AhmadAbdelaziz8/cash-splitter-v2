const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind v4 configuration
config.transformer.unstable_allowRequireContext = true;

// Add minification and optimization for Android builds
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true,
  },
  output: {
    comments: false,
  },
};

// Tree shaking optimization
config.resolver.unstable_enablePackageExports = true;

// Production optimizations for smaller bundle size
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = false;

// Disable source maps in production for smaller builds
if (process.env.NODE_ENV === "production") {
  config.transformer.enableBabelRuntime = false;
  config.serializer.createModuleIdFactory = () => (path) => {
    // Use shorter module IDs in production
    return path.replace(/.*[\\/]node_modules[\\/]/, "");
  };
}

module.exports = withNativeWind(config, { input: "./global.css" });
