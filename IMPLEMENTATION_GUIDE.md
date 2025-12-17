# Quick Implementation Guide

## The Issue
Your Angular library uses absolute paths in `tsconfig.base.json`, but consuming apps can't resolve them.

## Quick Fix (Choose One)

### Method 1: Use tsc-alias (Easiest)

1. **Install:**
   ```bash
   npm install --save-dev tsc-alias
   ```

2. **Update `package.json` scripts:**
   ```json
   {
     "scripts": {
       "build": "ng build my-lib --configuration production && tsc-alias -p tsconfig.lib.json"
     }
   }
   ```

3. **Ensure `tsconfig.lib.json` extends your base config and has correct paths**

### Method 2: Custom Post-Build Script

1. **Copy `resolve-paths.js` to your library root**
2. **Update the `PATH_MAPPINGS` object** in `resolve-paths.js` to match your paths
3. **Update `package.json`:**
   ```json
   {
     "scripts": {
       "build": "ng build my-lib --configuration production && node resolve-paths.js"
     }
   }
   ```

### Method 3: Use Relative Imports (Refactor)

Replace absolute imports with relative ones in your source code:
- `@my-lib/core` → `../core` or `./core`
- `@shared/utils` → `../../shared/utils`

## Verification

After building, check `dist/my-lib/*.js` files. They should contain relative imports like:
```javascript
import { something } from '../utils';
```

NOT absolute paths like:
```javascript
import { something } from '@my-lib/utils';
```

## For Consuming Apps

If you can't modify the library build, add path mappings to the consuming app's `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@my-lib/*": ["node_modules/my-lib/dist/*"]
    }
  }
}
```
