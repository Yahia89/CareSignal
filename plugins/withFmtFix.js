const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withFmtFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let content = fs.readFileSync(podfilePath, 'utf-8');

      const patchCode = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FMT_USE_CONSTEVAL=0'
        if target.name == 'fmt'
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'gnu++17'
        end
      end
    end
`;

      if (!content.includes("target.name == 'fmt'")) {
        content = content.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|${patchCode}`
        );
        fs.writeFileSync(podfilePath, content);
      }
      return config;
    },
  ]);
};
