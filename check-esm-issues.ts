#!/usr/bin/env tsx
/**
 * Check TypeScript files for ESM compatibility issues
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface Issue {
  file: string;
  line: number;
  issue: string;
  fix?: string;
}

function findTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkFile(filePath: string): Issue[] {
  const issues: Issue[] = [];
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for relative imports without .js extension
    const relativeImportMatch = line.match(/from\s+['"](\.\.?\/[^'"]+)['"]/);
    if (relativeImportMatch) {
      const importPath = relativeImportMatch[1];
      if (!importPath.endsWith('.js') && !importPath.endsWith('.json') && !importPath.includes('*')) {
        issues.push({
          file: filePath,
          line: lineNum,
          issue: `Relative import missing .js extension: ${importPath}`,
          fix: line.replace(importPath, importPath + '.js')
        });
      }
    }
    
    // Check for require() usage
    if (line.includes('require(') && !line.includes('//')) {
      issues.push({
        file: filePath,
        line: lineNum,
        issue: 'CommonJS require() detected - should use import',
        fix: 'Convert to: import ... from "..."'
      });
    }
    
    // Check for module.exports
    if (line.includes('module.exports')) {
      issues.push({
        file: filePath,
        line: lineNum,
        issue: 'CommonJS module.exports detected - should use export',
        fix: 'Convert to: export ... or export default ...'
      });
    }
    
    // Check for __dirname or __filename (CommonJS globals)
    if (line.includes('__dirname') || line.includes('__filename')) {
      issues.push({
        file: filePath,
        line: lineNum,
        issue: 'CommonJS __dirname/__filename detected',
        fix: 'Use: import { fileURLToPath } from "url"; import { dirname } from "path"; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);'
      });
    }
  });
  
  return issues;
}

// Main
const toolsDir = process.argv[2] || './tools';

console.log(`Checking ESM compatibility in: ${toolsDir}\n`);

try {
  const files = findTsFiles(toolsDir);
  console.log(`Found ${files.length} TypeScript files\n`);
  
  const allIssues: Issue[] = [];
  
  files.forEach(file => {
    const issues = checkFile(file);
    allIssues.push(...issues);
  });
  
  if (allIssues.length === 0) {
    console.log('✓ No ESM compatibility issues found!');
  } else {
    console.log(`Found ${allIssues.length} issue(s):\n`);
    
    let currentFile = '';
    allIssues.forEach(issue => {
      if (issue.file !== currentFile) {
        currentFile = issue.file;
        console.log(`\n${currentFile}:`);
      }
      console.log(`  Line ${issue.line}: ${issue.issue}`);
      if (issue.fix) {
        console.log(`    Fix: ${issue.fix}`);
      }
    });
    
    console.log(`\n\nTotal: ${allIssues.length} issue(s) to fix`);
  }
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
