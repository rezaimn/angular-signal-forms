# ESM Migration Guide for matrix-frontend Build Tools

## Problem

The error you're seeing:
```
Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. 
On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'
```

This occurs when trying to use ESM modules with Node.js on Windows without proper configuration.

## Solution Overview

To support inquirer v13+ (ESM-only) and modern ESM in your build tools, you need:

1. ✅ Add `package.json` with `"type": "module"` in the `tools/` directory
2. ✅ Update `tsconfig.json` to use `"module": "ESNext"` and `"moduleResolution": "Bundler"`
3. ✅ Add `.js` extensions to ALL relative imports in TypeScript files
4. ✅ Use `import.meta.url` and `fileURLToPath()` instead of `__dirname`
5. ✅ Update all dynamic imports and require() calls to use ESM syntax

## Step-by-Step Migration

### 1. Create `tools/package.json`

```json
{
  "name": "matrix-build-tools",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "description": "Build tools for matrix-frontend",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Critical:** The `"type": "module"` field tells Node.js to treat `.js` files as ESM.

### 2. Update `tools/tsconfig.json`

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "declaration": false,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "forceConsistentCasingInFileNames": true,
    "importHelpers": true,
    "lib": ["ESNext"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true,
    "outDir": "../dist/tools",
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "target": "ESNext",
    "types": ["node"],
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "../dist"]
}
```

**Key changes from your original config:**
- `"module": "ESNext"` instead of `"NodeNext"`
- `"moduleResolution": "Bundler"` instead of `"NodeNext"`
- Removed `"dom"` from lib (not needed for build tools)
- Added `"allowSyntheticDefaultImports": true`
- Added `"resolveJsonModule": true`

**Why "Bundler" instead of "NodeNext"?**
- `"Bundler"` works better with `tsx` and modern ESM tooling
- `"NodeNext"` is stricter and requires `.js` extensions in imports, but can cause issues with `tsx`
- `"Bundler"` allows ESM syntax while being more flexible with resolution

### 3. Update Import Statements

**❌ Old (CommonJS-style):**
```typescript
import { something } from './utils';
import { other } from '../config';
const data = require('./data.json');
```

**✅ New (ESM with extensions):**
```typescript
import { something } from './utils.js';
import { other } from '../config.js';
import data from './data.json' assert { type: 'json' };
```

**Critical:** Even though you're importing `.ts` files, you must use `.js` extensions in your import statements. TypeScript will handle this correctly during transpilation.

### 4. Replace `__dirname` and `__filename`

**❌ Old:**
```typescript
const configPath = path.join(__dirname, 'config.json');
```

**✅ New:**
```typescript
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = path.join(__dirname, 'config.json');
```

### 5. Update Dynamic Imports

**❌ Old:**
```typescript
const module = require('./dynamic-module');
```

**✅ New:**
```typescript
const module = await import('./dynamic-module.js');
```

### 6. Node.js Built-in Imports

Use the `node:` protocol for built-in modules (optional but recommended):

**✅ Recommended:**
```typescript
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
```

## Common Pitfalls

### 1. Missing `.js` Extensions

TypeScript won't auto-add extensions in ESM mode. You MUST add them manually:

```typescript
// ❌ Will fail at runtime
import { helper } from './helper';

// ✅ Correct
import { helper } from './helper.js';
```

### 2. Top-Level Await

In ESM, you can use top-level await:

```typescript
// ✅ This works in ESM
const data = await fetchData();

export const config = processData(data);
```

### 3. Named vs Default Imports

Some packages (like inquirer v13) use default exports:

```typescript
// ✅ Correct
import inquirer from 'inquirer';

// ❌ Won't work
import { prompt } from 'inquirer';
```

### 4. JSON Imports

```typescript
// ✅ Correct way to import JSON in ESM
import data from './data.json' assert { type: 'json' };

// Or use fs/promises
import { readFile } from 'node:fs/promises';
const data = JSON.parse(await readFile('./data.json', 'utf-8'));
```

## Testing Your Setup

After migration, test with:

```bash
# Install inquirer v13
npm install inquirer@latest

# Run your build script
npm run aduk
```

## File Checklist

Go through each `.ts` file in your `tools/` directory:

- [ ] Add `tools/package.json` with `"type": "module"`
- [ ] Update `tools/tsconfig.json` 
- [ ] Add `.js` extensions to all relative imports
- [ ] Replace `__dirname` with `fileURLToPath(import.meta.url)` pattern
- [ ] Replace `require()` with `import` or `await import()`
- [ ] Update JSON imports to use `import ... assert { type: 'json' }`
- [ ] Replace `module.exports` with `export` statements
- [ ] Replace `exports.foo` with `export const foo`
- [ ] Update any dynamic `require()` calls to `await import()`
- [ ] Add `node:` prefix to built-in module imports (optional but recommended)

## Updating Your Build Scripts

Your `tools/build/build.ts` might look like:

```typescript
#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import inquirer from 'inquirer';
import { runPreScripts } from './pre-scripts.js';
import { buildProject } from './builder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const config = await parseArguments();
  
  // Use inquirer v13
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'site',
      message: 'Select site:',
      choices: ['aduk', 'site2', 'site3'],
    },
  ]);
  
  await runPreScripts(config);
  await buildProject(config);
}

main().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
```

## Troubleshooting

### Error: "Cannot find module"

- Make sure you added `.js` extensions to your imports
- Check that the file actually exists
- Verify the path is correct (case-sensitive on Linux)

### Error: "SyntaxError: Unexpected token 'export'"

- Make sure `tools/package.json` has `"type": "module"`
- Verify you're using Node.js 18+

### Error: "ERR_UNKNOWN_FILE_EXTENSION"

- Check that your tsconfig has proper ESM settings
- Make sure you're not mixing CommonJS and ESM syntax

### tsx not working with ESM

`tsx` should work fine with ESM. If you have issues:

```bash
# Update tsx to latest
npm install -D tsx@latest

# Or use Node.js directly (after building)
node --loader ts-node/esm ./tools/build/build.ts
```

## Benefits of ESM

After migration, you'll have:

- ✅ Access to latest versions of ESM-only packages (inquirer v13+)
- ✅ Better tree-shaking and code splitting
- ✅ Top-level await support
- ✅ Aligned with modern JavaScript standards
- ✅ Better compatibility with modern tooling

## Additional Resources

- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [TypeScript ESM Support](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Inquirer v13 Documentation](https://github.com/SBoudrias/Inquirer.js)
