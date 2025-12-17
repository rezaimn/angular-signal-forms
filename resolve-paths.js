#!/usr/bin/env node

/**
 * Post-build script to resolve TypeScript path mappings to relative imports
 * This ensures published libraries don't contain absolute paths
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration - adjust these paths based on your library structure
const DIST_DIR = path.join(__dirname, 'dist');
const PATH_MAPPINGS = {
  '@my-lib/core': '../core',
  '@my-lib/utils': '../utils',
  '@shared/': '../shared/'
};

function resolvePaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace absolute path imports with relative paths
  for (const [absolutePath, relativePath] of Object.entries(PATH_MAPPINGS)) {
    const regex = new RegExp(`(['"])${absolutePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([/\\w-]*)['"]`, 'g');
    const newContent = content.replace(regex, (match, quote, rest) => {
      modified = true;
      const fileDir = path.dirname(filePath);
      const targetPath = path.join(DIST_DIR, relativePath + rest);
      const relativeImport = path.relative(fileDir, targetPath).replace(/\\/g, '/');
      return `${quote}${relativeImport.startsWith('.') ? relativeImport : './' + relativeImport}${quote}`;
    });
    content = newContent;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Resolved paths in: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = glob.sync('**/*.{js,d.ts}', { cwd: dir, absolute: true });
  files.forEach(resolvePaths);
  console.log(`Processed ${files.length} files`);
}

if (fs.existsSync(DIST_DIR)) {
  processDirectory(DIST_DIR);
} else {
  console.error(`Dist directory not found: ${DIST_DIR}`);
  process.exit(1);
}
