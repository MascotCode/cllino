#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for @react-navigation/native imports...');

// Cross-platform recursive file search
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other common ignore directories
        if (['node_modules', '.git', 'dist', 'build', '.next', 'scripts'].includes(file)) {
          continue;
        }
        results = results.concat(findFiles(fullPath, extensions));
      } else if (extensions.some(ext => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors or other issues
  }
  
  return results;
}

const rootDir = path.resolve(__dirname, '..');
const files = findFiles(rootDir);
let foundImports = [];

for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('@react-navigation/native')) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        // Look for actual import statements, not just any mention of the package
        if (line.trim().startsWith('import') && line.includes('@react-navigation/native')) {
          foundImports.push(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

if (foundImports.length > 0) {
  console.error('❌ Found @react-navigation/native imports (should use Expo Router instead):');
  foundImports.forEach(importLine => console.error(importLine));
  console.error('\n💡 Replace with:');
  console.error('  import { router, Link, useRouter } from "expo-router";');
  process.exit(1);
} else {
  console.log('✅ No @react-navigation/native imports found in source files');
  process.exit(0);
}
