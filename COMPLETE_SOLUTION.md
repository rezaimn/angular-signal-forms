# Complete Solution for Angular Library Path Resolution

## Problem Summary
Your library's `tsconfig.base.json` contains absolute path mappings that don't exist in consuming applications, causing TypeScript errors.

## Recommended Solution: Use `tsc-alias`

This tool automatically transforms absolute paths to relative imports during the build process.

### Step-by-Step Implementation

#### 1. Install tsc-alias
```bash
npm install --save-dev tsc-alias
```

#### 2. Update your `package.json` scripts
```json
{
  "scripts": {
    "build": "ng build my-lib --configuration production",
    "postbuild": "tsc-alias -p tsconfig.lib.production.json --resolve-full-paths",
    "prepublishOnly": "npm run build"
  }
}
```

**Important:** The `postbuild` script runs automatically after `build` completes.

#### 3. Ensure your `tsconfig.lib.production.json` (or `tsconfig.lib.json`) has:
- Correct `outDir` pointing to where ng-packagr outputs files
- All path mappings from `tsconfig.base.json`
- `declaration: true` for type definitions

#### 4. Verify the build output
After building, check files in `dist/my-lib/`:
- Open any `.js` file
- Search for your absolute paths (e.g., `@my-lib/`)
- They should be replaced with relative paths (e.g., `../core`)

### Alternative: Manual Path Resolution Script

If `tsc-alias` doesn't work with your setup, use the included `resolve-paths.js`:

1. Install `glob`: `npm install --save-dev glob`
2. Update `PATH_MAPPINGS` in `resolve-paths.js` to match your paths
3. Update `DIST_DIR` to point to your actual dist folder
4. Add to `package.json`: `"postbuild": "node resolve-paths.js"`

### Alternative: Refactor to Relative Imports

If you prefer not to use build-time transformation:

1. Replace all absolute imports in your source code with relative imports
2. Update `tsconfig.base.json` to remove path mappings (or keep them for IDE support only)
3. Rebuild and publish

**Example refactoring:**
```typescript
// Before
import { Util } from '@my-lib/utils';
import { Core } from '@my-lib/core';

// After  
import { Util } from './utils';
import { Core } from '../core';
```

### For Consuming Applications (If you can't modify library)

If you can't change the library build process, configure the consuming app:

**In consuming app's `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@my-lib/*": [
        "node_modules/my-lib/dist/*",
        "node_modules/my-lib/dist/my-lib/*"
      ]
    }
  }
}
```

**Note:** This only works if:
- The library exports match the path structure
- You're okay with requiring consuming apps to configure this

## Testing Your Solution

1. Build your library: `npm run build`
2. Check `dist/my-lib/esm2020/` or `dist/my-lib/fesm2022/` folders
3. Open any `.js` file and verify no absolute paths remain
4. Create a test app, install your library, and verify no TypeScript errors

## Common Issues

### Issue: tsc-alias can't find the files
**Solution:** Ensure `outDir` in `tsconfig.lib.json` matches where ng-packagr outputs files. Check `dist/my-lib/` structure.

### Issue: Paths still not resolved
**Solution:** 
- Verify path mappings in `tsconfig.lib.json` match `tsconfig.base.json`
- Try `--resolve-full-paths` flag with tsc-alias
- Check that `baseUrl` is set correctly

### Issue: Declaration files (.d.ts) still have absolute paths
**Solution:** tsc-alias should handle `.d.ts` files. Ensure you're running it on the correct output directory.

## Best Practice

For Angular libraries, the **best approach** is:
1. Use `tsc-alias` in postbuild step ✅
2. Keep path mappings in `tsconfig.base.json` for development ✅
3. Transform to relative imports during build ✅
4. Publish clean code without path dependencies ✅

This ensures your library works in any consuming application without additional configuration.
