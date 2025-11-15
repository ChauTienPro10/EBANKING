#!/usr/bin/env node

/**
 * Script to patch React Native CLI to use installGeneralDebug instead of installDebug
 * when product flavors are present
 */

const fs = require('fs');
const path = require('path');

const cliPlatformAndroidPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native-community',
  'cli-platform-android',
  'build',
  'commands',
  'runAndroid',
  'index.js'
);

if (!fs.existsSync(cliPlatformAndroidPath)) {
  console.log('React Native CLI platform-android not found. Skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(cliPlatformAndroidPath, 'utf8');

// Check if already patched
if (content.includes('installGeneralDebug')) {
  console.log('React Native CLI already patched.');
  process.exit(0);
}

// Replace installDebug with installGeneralDebug in the Gradle command
// This is a simple string replacement - might need adjustment based on actual CLI code
const patterns = [
  // Pattern 1: Direct task reference
  /(['"])(app:)?installDebug\1/g,
  // Pattern 2: In command strings
  /installDebug/g,
];

let modified = false;
patterns.forEach(pattern => {
  if (pattern.test(content)) {
    content = content.replace(pattern, (match) => {
      if (match.includes('installGeneralDebug')) {
        return match; // Already replaced
      }
      modified = true;
      return match.replace('installDebug', 'installGeneralDebug');
    });
  }
});

if (modified) {
  fs.writeFileSync(cliPlatformAndroidPath, content, 'utf8');
  console.log('✅ Successfully patched React Native CLI to use installGeneralDebug');
} else {
  console.log('⚠️  Could not find installDebug references to patch. The CLI structure might have changed.');
  console.log('   You may need to manually patch the file at:', cliPlatformAndroidPath);
}

