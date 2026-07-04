const { withPodfile } = require('@expo/config-plugins');

module.exports = function withMicPermission(config) {
  return withPodfile(config, (config) => {
    const requireLine = `require_relative '../node_modules/react-native-permissions/scripts/setup.rb'`;
    const permissionsBlock = `setup_permissions(['Microphone'])`;

    if (!config.modResults.contents.includes(requireLine)) {
      config.modResults.contents = config.modResults.contents.replace(
        /require 'json'/,
        `${requireLine}\n\nrequire 'json'`
      );
    }

    if (!config.modResults.contents.includes(permissionsBlock)) {
      config.modResults.contents = config.modResults.contents.replace(
        /use_expo_modules!/,
        `use_expo_modules!\n\n  ${permissionsBlock}`
      );
    }

    return config;
  });
};