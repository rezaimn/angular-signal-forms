# ESM Migration Guide for TypeScript Tools

## Issues to Fix

1. **Import extensions**: With `module: "NodeNext"`, all imports must use `.js` extensions (even though source files are `.ts`)
2. **Package.json**: The tools folder needs `"type": "module"` in package.json
3. **Import syntax**: All relative imports need explicit `.js` extensions
4. **Export syntax**: Use ESM `export` instead of CommonJS `module.exports`

## Required Changes

### 1. tools/tsconfig.json
Already updated with:
- `"module": "NodeNext"`
- `"moduleResolution": "NodeNext"`

### 2. tools/package.json
Add:
```json
{
  "type": "module"
}
```

### 3. Update all imports in .ts files
Change:
```ts
import { something } from './file'
```
To:
```ts
import { something } from './file.js'
```

### 4. Update all exports
Change:
```ts
module.exports = { ... }
```
To:
```ts
export { ... }
```

### 5. Update tsx command
Ensure tsx can handle ESM properly (it should, but verify)
