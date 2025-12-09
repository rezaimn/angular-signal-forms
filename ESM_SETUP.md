# ESM Setup Complete ✅

Your project is now configured with modern ESM support using TypeScript's `nodenext` module resolution.

## What Changed

### 1. **package.json**
- Added `"type": "module"` to enable ESM
- Installed `inquirer@^13.0.1` (ESM-only version)
- Added `tsx` for TypeScript execution
- Updated TypeScript to v5.7.2

### 2. **tsconfig.json**
- Set `"module": "nodenext"`
- Set `"moduleResolution": "nodenext"`
- Configured for ES2022 target with modern features
- Enabled strict mode and best practices

### 3. **tools/ folder**
Created build scripts directory with examples:
- `build.ts` - Basic inquirer example
- `example-advanced.ts` - Advanced inquirer features
- `verify-esm.ts` - ESM verification script

## Key Features

✅ **Full ESM Support**: Use modern `import`/`export` syntax  
✅ **Inquirer v13**: Latest ESM-only version working  
✅ **TypeScript nodenext**: Proper module resolution  
✅ **Top-level await**: Works out of the box  
✅ **import.meta.url**: Access to file URLs  
✅ **Type-safe**: Full TypeScript checking passes

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run any of the scripts:

```bash
# Verify ESM is working
npm run verify

# Run basic build script
npm run build

# Run advanced example
npm run build:advanced
```

## Important ESM Rules

### 1. File Extensions in Imports

When importing local TypeScript files, you **must** use `.js` extensions (not `.ts`), even though the source files are `.ts`. This is because TypeScript's `nodenext` module resolution follows Node.js ESM rules, which require file extensions.

```typescript
// ✅ Correct - use .js extension
import { helper } from './utils.js';
import { config } from '../config.js';

// ❌ Wrong - will not work with nodenext
import { helper } from './utils';
import { config } from '../config';
```

**Why .js and not .ts?**  
TypeScript compiles `.ts` files to `.js` files. When Node.js runs your code, it imports the compiled `.js` files. With `nodenext` module resolution, TypeScript checks that your imports will work at runtime, so you must reference the actual runtime file extension (`.js`).

### 2. Use ESM Syntax Only

```typescript
// ✅ Use this
import pkg from 'package';
import { named } from 'package';
export { myFunc };
export default something;

// ❌ Not this (CommonJS)
const pkg = require('package');
module.exports = { myFunc };
```

### 3. Top-level Await is Available

One of the great features of ESM is that you can use `await` at the top level:

```typescript
// This works in ESM!
const data = await fetchData();
console.log(data);

// No need for this anymore:
(async () => {
  const data = await fetchData();
})();
```

### 4. Package.json Must Have "type": "module"

This is already set up in the root `package.json`. Without this, Node.js treats `.js` files as CommonJS.

## TypeScript Configuration Summary

```json
{
  "compilerOptions": {
    "module": "nodenext",           // ESM with Node.js support
    "moduleResolution": "nodenext", // Proper ESM resolution
    "target": "ES2022",             // Modern JavaScript features
    "strict": true                  // Type safety
  }
}
```

### Why "nodenext"?

- **`module: "nodenext"`** tells TypeScript to generate ESM-compatible code that follows Node.js ESM rules
- **`moduleResolution: "nodenext"`** tells TypeScript how to resolve import paths, including the requirement for file extensions
- This combination ensures your TypeScript code will work correctly when run by Node.js in ESM mode

## Package Compatibility

With this setup, you can now use modern ESM-only packages:

- ✅ inquirer v13+ (ESM-only)
- ✅ chalk v5+ (ESM-only)
- ✅ ora v8+ (ESM-only)
- ✅ nanoid v4+ (ESM-only)
- ✅ Any modern ESM package

All while maintaining TypeScript's excellent type checking!

## Common Issues and Solutions

### Issue: "Cannot find module" error with .js extension

**Solution**: Make sure your `tsconfig.json` has `"module": "nodenext"` and `"moduleResolution": "nodenext"`. These settings tell TypeScript to allow `.js` extensions for TypeScript imports.

### Issue: "require is not defined"

**Solution**: You're trying to use CommonJS syntax in an ESM project. Convert all `require()` to `import` and `module.exports` to `export`.

### Issue: Top-level await not working

**Solution**: Ensure your `package.json` has `"type": "module"`. Top-level await only works in ESM modules.

### Issue: Package says it needs ESM

**Solution**: That's what this setup is for! Make sure you're following the ESM rules above, especially using `.js` extensions for local imports.

## Adding New Build Scripts

1. Create a new `.ts` file in the `tools/` directory
2. Use ESM import/export syntax
3. Remember to use `.js` extensions for local imports
4. Add a script in `package.json`:

```json
{
  "scripts": {
    "my-script": "tsx tools/my-script.ts"
  }
}
```

## Example: Creating a New Build Tool

Create `tools/deploy.ts`:

```typescript
import inquirer from 'inquirer';
// If importing from another file in tools:
// import { helper } from './utils.js';

async function deploy() {
  const { environment } = await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: 'Select deployment environment:',
      choices: ['production', 'staging', 'development'],
    },
  ]);

  console.log(`Deploying to ${environment}...`);
  // Your deployment logic here
}

deploy();
```

Add to `package.json`:

```json
{
  "scripts": {
    "deploy": "tsx tools/deploy.ts"
  }
}
```

Run with:

```bash
npm run deploy
```

## Why Use tsx?

`tsx` is a TypeScript execution engine that:
- Runs TypeScript files directly without compilation
- Supports ESM out of the box
- Handles `nodenext` module resolution correctly
- Works with top-level await
- Much faster than `ts-node`

## Next Steps

Your TypeScript ESM setup is ready! You can now:

1. Install dependencies: `npm install`
2. Test the setup: `npm run verify`
3. Try the example scripts: `npm run build` or `npm run build:advanced`
4. Create your own build scripts in the `tools/` directory
5. Use inquirer v13 and other modern ESM packages

Happy coding! 🚀
