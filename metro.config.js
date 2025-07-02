const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('sql');

// Fix for victory-native exports resolution on Android
config.resolver.unstable_enablePackageExports = false

module.exports = withNativeWind(config, { input: "./global.css" });
