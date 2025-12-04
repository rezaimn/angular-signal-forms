# ESM Migration for matrix-frontend Build Tools

This repository contains a complete working example and migration guide for converting your matrix-frontend build tools from CommonJS to ESM, enabling you to use inquirer v13+ and other modern ESM-only packages.

## Quick Start

The error you're seeing on Windows:
```
Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. 
On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'
```

**Root cause:** Your build scripts need to be properly configured for ESM.

## What's Included

### 📚 Documentation
- **[ESM_MIGRATION_GUIDE.md](./ESM_MIGRATION_GUIDE.md)** - Complete step-by-step migration guide
- **[REFACTORING_EXAMPLES.md](./REFACTORING_EXAMPLES.md)** - Real-world refactoring examples

### 🛠️ Example Code
- **[tools/package.json](./tools/package.json)** - Package config with `"type": "module"`
- **[tools/tsconfig.json](./tools/tsconfig.json)** - TypeScript config for ESM
- **[tools/build/build.ts](./tools/build/build.ts)** - Main build script with inquirer v13
- **[tools/build/pre-scripts.ts](./tools/build/pre-scripts.ts)** - Pre-build validation
- **[tools/build/builder.ts](./tools/build/builder.ts)** - Build logic

## TL;DR - The Fix

1. **Create `tools/package.json`:**
   ```json
   {
     "type": "module"
   }
   ```

2. **Update `tools/tsconfig.json`:**
   ```json
   {
     "compilerOptions": {
       "module": "ESNext",
       "moduleResolution": "Bundler"
     }
   }
   ```

3. **Add `.js` extensions to imports:**
   ```typescript
   import { something } from './module.js';  // ✅
   import { something } from './module';     // ❌
   ```

4. **Replace `__dirname`:**
   ```typescript
   import { fileURLToPath } from 'node:url';
   import { dirname } from 'node:path';
   
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);
   ```

5. **Use ESM exports:**
   ```typescript
   export function something() { }           // ✅
   module.exports = { something };           // ❌
   ```

## Migration Checklist

Apply these changes to your actual `matrix-frontend` project:

### Configuration Files
- [ ] Create `tools/package.json` with `"type": "module"`
- [ ] Update `tools/tsconfig.json` to use ESM settings
- [ ] Update root `package.json` dependencies (inquirer@13+)

### Code Changes
- [ ] Add `.js` extensions to all relative imports in `tools/**/*.ts`
- [ ] Replace `__dirname` with `fileURLToPath(import.meta.url)` pattern
- [ ] Convert `require()` to `import` statements
- [ ] Convert `module.exports` to `export` statements
- [ ] Update JSON imports to use import assertions
- [ ] Add `node:` prefix to built-in imports (optional)

### Testing
- [ ] Run `npm install` to get latest dependencies
- [ ] Test with `npm run aduk`
- [ ] Verify all build commands work
- [ ] Check that inquirer prompts display correctly

## Key Concepts

### Why This Error Happens on Windows

Node.js ESM loader expects file:// URLs, but Windows paths like `C:\Users\...` aren't valid URLs. The solution is proper ESM configuration, not path conversion.

### Why "Bundler" Module Resolution?

- Works seamlessly with `tsx`
- More flexible than "NodeNext"
- Better compatibility with modern tooling
- Still provides full ESM support

### Why .js Extensions in TypeScript?

TypeScript doesn't rewrite import paths. In ESM, you must specify the extension that will exist at runtime (the compiled .js file), not the source .ts file.

## Testing the Example

```bash
# Install dependencies
npm install

# Run the example build script
npm run aduk
```

## Project Structure

```
tools/
├── package.json          # Contains "type": "module"
├── tsconfig.json         # ESM configuration
└── build/
    ├── build.ts          # Main entry point
    ├── pre-scripts.ts    # Pre-build checks
    └── builder.ts        # Build logic
```

## Common Issues & Solutions

### Issue: "Cannot find module"
**Solution:** Add `.js` extension to your import

### Issue: "__dirname is not defined"
**Solution:** Use `fileURLToPath(import.meta.url)` pattern

### Issue: "require is not defined"
**Solution:** Convert to `import` or `await import()`

### Issue: "SyntaxError: Unexpected token 'export'"
**Solution:** Add `"type": "module"` to `tools/package.json`

## Benefits After Migration

✅ Use inquirer v13+ (ESM-only)  
✅ Top-level await support  
✅ Better tree-shaking  
✅ Modern JavaScript standards  
✅ Future-proof build tools  

## Additional Resources

- [Node.js ESM Docs](https://nodejs.org/api/esm.html)
- [TypeScript ESM Support](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Inquirer v13 Docs](https://github.com/SBoudrias/Inquirer.js)

## Need Help?

Refer to:
1. `ESM_MIGRATION_GUIDE.md` for detailed step-by-step instructions
2. `REFACTORING_EXAMPLES.md` for before/after code examples
3. Example code in `tools/build/` directory

## Summary

The key to fixing your Windows ESM error is:
1. Add `"type": "module"` to tools/package.json
2. Use proper TypeScript ESM configuration
3. Add `.js` extensions to relative imports
4. Replace CommonJS patterns with ESM equivalents

All the example code in this repo works and can be used as a reference for your refactoring.
