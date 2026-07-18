const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../node_modules/react-native-reanimated/Common/cpp/reanimated/NativeModules/ReanimatedModuleProxy.cpp');

if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Guard shadowNodeFromValue with RCT_NEW_ARCH_ENABLED to fix compilation on the old architecture
  const target = '#if REACT_NATIVE_MINOR_VERSION >= 81\nstatic inline std::shared_ptr<const ShadowNode> shadowNodeFromValue';
  const targetCRLF = '#if REACT_NATIVE_MINOR_VERSION >= 81\r\nstatic inline std::shared_ptr<const ShadowNode> shadowNodeFromValue';
  
  const replacement = '#if REACT_NATIVE_MINOR_VERSION >= 81 && defined(RCT_NEW_ARCH_ENABLED)\nstatic inline std::shared_ptr<const ShadowNode> shadowNodeFromValue';
  const replacementCRLF = '#if REACT_NATIVE_MINOR_VERSION >= 81 && defined(RCT_NEW_ARCH_ENABLED)\r\nstatic inline std::shared_ptr<const ShadowNode> shadowNodeFromValue';

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully patched react-native-reanimated for old architecture compatibility (LF).');
  } else if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, replacementCRLF);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully patched react-native-reanimated for old architecture compatibility (CRLF).');
  } else if (content.includes('defined(RCT_NEW_ARCH_ENABLED)')) {
    console.log('react-native-reanimated is already patched.');
  } else {
    console.warn('Could not find the target signature to patch in ReanimatedModuleProxy.cpp');
  }
} else {
  console.log('ReanimatedModuleProxy.cpp not found. Skipping patch.');
}
