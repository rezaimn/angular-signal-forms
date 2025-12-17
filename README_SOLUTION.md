# Angular Library Path Resolution - Quick Fix

## The Problem
Your library's `tsconfig.base.json` has absolute paths like `@my-lib/core` that consuming apps can't resolve.

## The Solution (Pick One)

### ✅ Option 1: Use `tsc-alias` (Recommended - 2 minutes)

1. **Install:**
   ```bash
   npm install --save-dev tsc-alias
   ```

2. **Add to `package.json`:**
   ```json
   {
     "scripts": {
       "build": "ng build my-lib --configuration production",
       "postbuild": "tsc-alias -p tsconfig.lib.json"
     }
   }
   ```

3. **Done!** Now `npm run build` will automatically resolve paths.

### Option 2: Custom Script

Use `resolve-library-paths.js` - update the library name in the script, then:
```json
{
  "scripts": {
    "postbuild": "node resolve-library-paths.js"
  }
}
```

### Option 3: Refactor to Relative Imports

Replace `@my-lib/utils` with `../utils` in your source code.

---

## Which Should You Use?

- **Use Option 1** if you want the quickest fix
- **Use Option 2** if `tsc-alias` doesn't work with your setup  
- **Use Option 3** if you prefer simpler code without build-time transformations

See `COMPLETE_SOLUTION.md` for detailed explanations.
