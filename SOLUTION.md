# Fixing Angular Library Path Resolution Issues

## The Problem
When your Angular library uses absolute path mappings in `tsconfig.base.json` (like `@my-lib/core` or `@shared/utils`), consuming applications can't resolve these paths because they don't exist in the consuming app's context.

## Solution Options

### Option 1: Transform Paths During Build (Best for Published Libraries)

This transforms absolute paths to relative imports during the build, so the published code doesn't contain path mappings.

#### Step 1: Install `tsc-alias`
```bash
npm install --save-dev tsc-alias
```

#### Step 2: Update your `package.json` build script
```json
{
  "scripts": {
    "build": "ng build my-lib --configuration production",
    "resolve-paths": "tsc-alias -p tsconfig.lib.json",
    "build:lib": "ng build my-lib --configuration production && npm run resolve-paths",
    "prepublishOnly": "npm run build:lib"
  }
}
```

#### Step 3: Configure `tsconfig.lib.json` to output to a temporary directory
```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist/out-tsc/lib",
    "declaration": true,
    "declarationMap": true,
    "inlineSources": true,
    "baseUrl": "./",
    "paths": {
      "@my-lib/core": ["projects/my-lib/src/lib/core/index.ts"],
      "@my-lib/utils": ["projects/my-lib/src/lib/utils/index.ts"]
    }
  }
}
```

#### Step 4: Update your build process
After `ng build`, run `tsc-alias` to transform the paths in the compiled output.

### Option 2: Use Relative Imports in Library Code

Instead of absolute paths, use relative imports in your library source code:

**Before:**
```typescript
import { SomeUtil } from '@my-lib/utils';
```

**After:**
```typescript
import { SomeUtil } from '../utils';
```

This is the simplest solution but requires refactoring.

### Option 3: Configure Consuming Application

Have consuming applications add matching path mappings to their `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@my-lib/core": ["node_modules/my-angular-library/dist/core"],
      "@my-lib/utils": ["node_modules/my-angular-library/dist/utils"]
    }
  }
}
```

**Note:** This only works if your library exports these as separate entry points.

### Option 4: Use ng-packagr with Custom Build

Configure `ng-packagr` to handle path resolution:

1. Create a custom builder or use `ng-packagr` with path transformation
2. Use a post-build script to replace paths in the output

## Recommended Approach

For a published library, **Option 1** (tsc-alias) is recommended because:
- ✅ No changes needed in consuming apps
- ✅ Works with any consuming application
- ✅ Transforms paths at build time
- ✅ Clean published code

## Implementation Steps

1. Install `tsc-alias`: `npm install --save-dev tsc-alias`
2. Update build scripts to run `tsc-alias` after compilation
3. Ensure your `tsconfig.lib.json` has the correct path mappings
4. Test by building and checking the output doesn't contain absolute paths

## Verification

After building, check your `dist` folder. The compiled JavaScript files should use relative imports like:
```javascript
const utils_1 = require("../utils");
```

Instead of:
```javascript
const utils_1 = require("@my-lib/utils");
```
