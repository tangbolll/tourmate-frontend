const { getDefaultConfig } = require("expo/metro-config");
const path = require("path"); // Add this line

const config = getDefaultConfig(__dirname);

// Add this block for web-specific aliasing
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    // Use path.resolve to get an absolute path
    return context.resolveRequest(context, path.resolve(__dirname, './web/react-native-maps-mock.js'), platform);
  }
  // Fallback to the default resolver
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.platforms = ['ios', 'android', 'web']; // Ensure web is included

module.exports = config;