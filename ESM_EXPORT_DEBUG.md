# ESM Export Debugging

If `export const handleBarConfigForIndexHtml` is already inline but still getting the error, check:

## Possible Issues:

1. **Duplicate exports** - Check if you have BOTH inline export AND export statement at bottom
2. **TypeScript compilation** - tsx might not be compiling correctly
3. **File extension in import** - Must use `.js` even though source is `.ts`
4. **Package.json type** - Must have `"type": "module"` in tools/package.json
5. **Circular dependencies** - Could cause export resolution issues
6. **Syntax errors** - Any syntax error prevents proper export

## Quick Checks:

1. Verify the import statement uses `.js`:
   ```ts
   import { handleBarConfigForIndexHtml } from '../../tasks/site.task.js';
   ```

2. Check if there's a conflicting export at the bottom:
   ```ts
   // BAD - don't have both:
   export const handleBarConfigForIndexHtml = ...;
   // ... later ...
   export { handleBarConfigForIndexHtml }; // This could cause issues
   ```

3. Verify tools/package.json has:
   ```json
   {
     "type": "module"
   }
   ```

4. Check for any syntax errors in site.task.ts that might prevent compilation

5. Try explicit default export instead:
   ```ts
   export { handleBarConfigForIndexHtml as default };
   ```

6. Check if tsx is using the right tsconfig
