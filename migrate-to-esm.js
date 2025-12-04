#!/usr/bin/env node
/**
 * Migration script to update TypeScript files for ESM support
 * 
 * This script:
 * 1. Updates all relative imports to include .js extensions
 * 2. Converts CommonJS exports to ESM exports
 * 3. Updates require() calls to import statements
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findTsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function updateImports(content, filePath) {
  // Update relative imports to include .js extension
  // Matches: import ... from './file' or import ... from '../file'
  content = content.replace(
    /from\s+['"](\.\.?\/[^'"]+)['"]/g,
    (match, importPath) => {
      // Skip if already has .js extension
      if (importPath.endsWith('.js')) {
        return match;
      }
      // Skip if it's a directory import (will be handled by index.js)
      if (!importPath.includes('.')) {
        return match;
      }
      // Add .js extension
      return match.replace(importPath, importPath + '.js');
    }
  );
  
  // Update require() to import (basic conversion)
  // This is a simple pattern - might need manual review
  content = content.replace(
    /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
    (match, varName, modulePath) => {
      if (modulePath.startsWith('.')) {
        const ext = modulePath.endsWith('.js') ? '' : '.js';
        return `import ${varName} from '${modulePath}${ext}'`;
      }
      return `import ${varName} from '${modulePath}'`;
    }
  );
  
  // Convert module.exports to export
  content = content.replace(
    /module\.exports\s*=\s*{([^}]+)}/gs,
    (match, exports) => {
      return `export {${exports}}`;
    }
  );
  
  content = content.replace(
    /module\.exports\s*=\s*(\w+)/g,
    (match, exportName) => {
      return `export default ${exportName}`;
    }
  );
  
  return content;
}

function migrateFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const updated = updateImports(content, filePath);
    
    if (content !== updated) {
      writeFileSync(filePath, updated, 'utf-8');
      console.log(`✓ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const toolsDir = process.argv[2] || './tools';
console.log(`Migrating TypeScript files in: ${toolsDir}`);

try {
  const files = findTsFiles(toolsDir);
  console.log(`Found ${files.length} TypeScript files`);
  
  let updatedCount = 0;
  files.forEach(file => {
    if (migrateFile(file)) {
      updatedCount++;
    }
  });
  
  console.log(`\nMigration complete! Updated ${updatedCount} files.`);
  console.log('\nNext steps:');
  console.log('1. Review the changes');
  console.log('2. Add "type": "module" to tools/package.json');
  console.log('3. Test the build script');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
