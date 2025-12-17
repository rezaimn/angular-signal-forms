#!/usr/bin/env node

/**
 * Post-build script to resolve TypeScript path mappings in Angular library output
 * Works with ng-packagr output structure
 */

const fs = require('fs');
const path = require('path');

// Read tsconfig to get path mappings
function getPathMappings(tsconfigPath) {
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    return tsconfig.compilerOptions?.paths || {};
  } catch (e) {
    console.error(`Could not read ${tsconfigPath}:`, e.message);
    return {};
  }
}

// Convert absolute path to relative path
function toRelativePath(fromFile, toFile, baseUrl) {
  const fromDir = path.dirname(fromFile);
  const relative = path.relative(fromDir, toFile);
  return relative.replace(/\\/g, '/').replace(/^\.\.\//, './') || './';
}

// Resolve path mapping to actual file path
function resolvePathMapping(mappingPath, baseUrl, projectRoot) {
  if (Array.isArray(mappingPath)) {
    mappingPath = mappingPath[0];
  }
  
  if (path.isAbsolute(mappingPath)) {
    return mappingPath;
  }
  
  return path.resolve(projectRoot, baseUrl || '.', mappingPath);
}

// Replace absolute imports with relative imports
function replaceImports(content, filePath, pathMappings, baseUrl, projectRoot, distRoot) {
  let modified = false;
  let newContent = content;

  // Match import/require statements with absolute paths
  const importRegex = /(import|export|require\s*\()\s*(['"])([@\w][\w\-/]*)(['"])/g;
  
  newContent = newContent.replace(importRegex, (match, keyword, quote1, importPath, quote2) => {
    // Check if this import matches any of our path mappings
    for (const [mappedPath, targetPaths] of Object.entries(pathMappings)) {
      const targetPath = Array.isArray(targetPaths) ? targetPaths[0] : targetPaths;
      
      // Check exact match or prefix match
      if (importPath === mappedPath || importPath.startsWith(mappedPath + '/')) {
        modified = true;
        
        // Resolve the actual file path
        const actualTargetPath = resolvePathMapping(targetPath, baseUrl, projectRoot);
        
        // If it's a directory mapping with wildcard
        if (mappedPath.endsWith('/*')) {
          const suffix = importPath.replace(mappedPath.replace('/*', ''), '');
          const fullTargetPath = path.join(actualTargetPath.replace('/*', ''), suffix);
          
          // Find the actual file (could be .ts, .js, or index)
          let resolvedFile = fullTargetPath;
          if (!fs.existsSync(resolvedFile + '.ts') && !fs.existsSync(resolvedFile + '.js')) {
            if (fs.existsSync(path.join(resolvedFile, 'index.ts'))) {
              resolvedFile = path.join(resolvedFile, 'index');
            } else if (fs.existsSync(path.join(resolvedFile, 'index.js'))) {
              resolvedFile = path.join(resolvedFile, 'index');
            }
          }
          
          // Calculate relative path from dist output
          const relativePath = toRelativePath(filePath, resolvedFile, baseUrl);
          return `${keyword}${quote1}${relativePath}${quote2}`;
        } else {
          // Exact path mapping
          let resolvedFile = actualTargetPath;
          if (!fs.existsSync(resolvedFile + '.ts') && !fs.existsSync(resolvedFile + '.js')) {
            if (fs.existsSync(path.join(resolvedFile, 'index.ts'))) {
              resolvedFile = path.join(resolvedFile, 'index');
            } else if (fs.existsSync(path.join(resolvedFile, 'index.js'))) {
              resolvedFile = path.join(resolvedFile, 'index');
            }
          }
          
          // Map to dist location
          const distTargetPath = resolvedFile.replace(projectRoot, distRoot).replace(/\.ts$/, '');
          const relativePath = toRelativePath(filePath, distTargetPath, baseUrl);
          return `${keyword}${quote1}${relativePath}${quote2}`;
        }
      }
    }
    
    return match;
  });

  return { content: newContent, modified };
}

// Process a single file
function processFile(filePath, pathMappings, baseUrl, projectRoot, distRoot) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, modified } = replaceImports(
      content,
      filePath,
      pathMappings,
      baseUrl,
      projectRoot,
      distRoot
    );

    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    return false;
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e.message);
    return false;
  }
}

// Recursively process directory
function processDirectory(dir, pathMappings, baseUrl, projectRoot, distRoot) {
  const files = fs.readdirSync(dir);
  let processedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processedCount += processDirectory(filePath, pathMappings, baseUrl, projectRoot, distRoot);
    } else if (file.endsWith('.js') || file.endsWith('.d.ts')) {
      if (processFile(filePath, pathMappings, baseUrl, projectRoot, distRoot)) {
        processedCount++;
      }
    }
  });

  return processedCount;
}

// Main execution
function main() {
  const projectRoot = process.cwd();
  const tsconfigPath = path.join(projectRoot, 'tsconfig.base.json');
  const distRoot = path.join(projectRoot, 'dist');
  
  // Try to find the actual library dist folder (ng-packagr structure)
  let libDistPath = distRoot;
  const possiblePaths = [
    path.join(distRoot, 'my-lib'), // Adjust 'my-lib' to your library name
    distRoot
  ];
  
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      libDistPath = possiblePath;
      break;
    }
  }

  const pathMappings = getPathMappings(tsconfigPath);
  
  if (Object.keys(pathMappings).length === 0) {
    console.warn('No path mappings found in tsconfig.base.json');
    return;
  }

  console.log(`Processing files in: ${libDistPath}`);
  console.log(`Path mappings found: ${Object.keys(pathMappings).join(', ')}`);

  const processed = processDirectory(
    libDistPath,
    pathMappings,
    './',
    projectRoot,
    libDistPath
  );

  console.log(`✓ Resolved paths in ${processed} files`);
}

main();
