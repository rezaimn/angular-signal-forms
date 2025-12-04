# Comprehensive ESM Fix for handleBarConfigForIndexHtml Error

## The Error:
```
SyntaxError: The requested module '../../tasks/site.task.js' does not provide an export named 'handleBarConfigForIndexHtml'
```

## Possible Causes & Fixes:

### 1. **Check the import path**
Make sure `dynamic-files.ts` imports with `.js` extension:
```ts
import { handleBarConfigForIndexHtml } from '../../tasks/site.task.js';
//                                                              ^^^^ Must be .js
```

### 2. **Verify package.json has type: module**
In `tools/package.json`:
```json
{
  "type": "module"
}
```

### 3. **Check for syntax errors**
Any syntax error in `site.task.ts` prevents proper export. Run:
```bash
tsc --noEmit tools/build/tasks/site.task.ts
```

### 4. **Try explicit re-export**
At the bottom of `site.task.ts`, try:
```ts
// If already exported inline, re-export explicitly
export { handleBarConfigForIndexHtml };
```

### 5. **Check tsx configuration**
tsx might need explicit ESM support. Try running with:
```bash
NODE_OPTIONS="--loader tsx/esm" tsx ./tools/build/build.ts ...
```

Or ensure tsx version supports ESM (v4+)

### 6. **Verify the function is actually exported**
Add this at the bottom of `site.task.ts` temporarily:
```ts
console.log('Exports:', Object.keys(module.exports || {}));
```

### 7. **Check for circular dependencies**
If `site.task.ts` imports from something that imports from `site.task.ts`, it can break exports.

### 8. **Try default export instead**
In `site.task.ts`:
```ts
export default {
  handleBarConfigForIndexHtml,
  buildSite,
  handleBarSettings,
  minifyFileGulpTask,
};
```

Then import as:
```ts
import siteTask from '../../tasks/site.task.js';
const { handleBarConfigForIndexHtml } = siteTask;
```

### 9. **Check TypeScript compilation output**
See what TypeScript actually emits:
```bash
tsc --module NodeNext --moduleResolution NodeNext tools/build/tasks/site.task.ts --outDir ./temp
cat ./temp/tasks/site.task.js | grep handleBarConfigForIndexHtml
```

### 10. **Most Likely: tsx ESM issue**
tsx might not be handling ESM correctly. Try:
- Update tsx to latest: `npm install -D tsx@latest`
- Or use `ts-node` with ESM loader
- Or compile first then run: `tsc && node dist/tools/build/build.js`
