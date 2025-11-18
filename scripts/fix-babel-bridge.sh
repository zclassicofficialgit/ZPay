#!/bin/bash
# Fix Babel 6/7 compatibility for electron-compilers
#
# Problem: electron-compilers has its own nested babel-core@6.26.3
# which doesn't work with Babel 7 plugins in .babelrc
#
# Solution: Remove nested babel-core and let it use the root-level
# babel-core@7.0.0-bridge.0 (configured in package.json resolutions)

echo "Fixing Babel bridge compatibility..."

if [ -d "node_modules/electron-compilers/node_modules/babel-core" ]; then
  echo "Removing nested babel-core from electron-compilers..."
  rm -rf node_modules/electron-compilers/node_modules/babel-core
  echo "✅ Done! electron-compilers will now use root babel-core@7.0.0-bridge.0"
else
  echo "✅ Already fixed - no nested babel-core found"
fi
