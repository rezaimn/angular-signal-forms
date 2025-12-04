# ESM Migration Fix Checklist

## Root Cause
The error `Only URLs with a scheme in: file, data, and node are supported` occurs because:
1. ESM requires explicit file extensions in imports
2. Windows paths need proper URL handling
3. Package.json needs `"type": "module"`

## Step-by-Step Fix

### 1. Update `tools/package.json`
Add `"type": "module"` at the top level:
```json
{
  "type": "module",
  ...
}
```

### 2. Update all imports in `tools/**/*.ts`
Change all relative imports to include `.js` extension:
- `import x from './file'` → `import x from './file.js'`
- `import x from '../utils'` → `import x from '../utils/index.js'` (or specific file)

### 3. Convert CommonJS to ESM
- `require()` → `import`
- `module.exports` → `export`
- `exports.xxx` → `export const xxx`

### 4. Update tsconfig.json (already done ✓)
Your config looks correct with `module: "NodeNext"` and `moduleResolution: "NodeNext"`

### 5. Common Issues to Watch For

#### Directory imports
If you have `import x from './utils'`, you need either:
- `import x from './utils/index.js'` (if utils/index.ts exists)
- Or create `utils/index.ts` that re-exports

#### Dynamic imports
Keep using `import()` for dynamic imports, they work fine in ESM

#### __dirname and __filename
Replace with:
```ts
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### 6. Test
Run: `npm run serve -- --site=aduk`

## Quick Fix Script
Run the migration script (if you have Node.js with ESM support):
```bash
node migrate-to-esm.js ./tools
```

Or manually update imports using find/replace:
- Find: `from ['"](\.[^'"]+)['"]`
- Replace: `from '$1.js'` (but be careful with already .js extensions)
