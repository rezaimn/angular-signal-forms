# Build Tools

Modern ESM-based build tools using TypeScript and Inquirer v13.

## Features

✅ **Full ESM Support** - Uses modern `import`/`export` syntax  
✅ **Inquirer v13** - Latest ESM-only version  
✅ **TypeScript nodenext** - Proper module resolution  
✅ **Top-level await** - Works out of the box  
✅ **Type-safe** - Full TypeScript checking

## Available Scripts

```bash
# Verify ESM setup is working
npm run verify

# Run basic build script with prompts
npm run build

# Run advanced inquirer examples
npm run build:advanced
```

## File Structure

- `build.ts` - Basic inquirer example showing interactive build configuration
- `example-advanced.ts` - Advanced inquirer features (checkbox, validation, editor, etc.)
- `verify-esm.ts` - Quick verification that ESM and top-level await work

## Important ESM Rules

When working with ESM in TypeScript with `nodenext` module resolution:

1. **File extensions in imports** - Always use `.js` extensions when importing local files, even though they're `.ts`:
   ```typescript
   // ✅ Correct
   import { helper } from './utils.js';
   
   // ❌ Wrong
   import { helper } from './utils';
   ```

2. **ESM syntax only**:
   ```typescript
   // ✅ Use this
   import pkg from 'package';
   export { myFunc };
   
   // ❌ Not this
   const pkg = require('package');
   module.exports = { myFunc };
   ```

3. **Top-level await** is available without wrapping in async function:
   ```typescript
   const data = await fetchData();
   ```

## Adding More Build Scripts

Create new `.ts` files in this directory and add corresponding npm scripts in `package.json`:

```json
{
  "scripts": {
    "my-script": "tsx tools/my-script.ts"
  }
}
```
