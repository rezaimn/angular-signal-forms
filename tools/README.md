# Build Tools

This folder contains build scripts using modern ESM with TypeScript.

## Configuration

- **Module System**: ESM (ECMAScript Modules)
- **TypeScript Module**: `nodenext`
- **TypeScript Module Resolution**: `nodenext`
- **Runtime**: Node.js with `tsx` for TypeScript execution

## Key Features

- ✅ Full ESM support with `"type": "module"` in package.json
- ✅ TypeScript with `nodenext` module resolution
- ✅ Inquirer v13+ support (ESM-only)
- ✅ Modern import/export syntax
- ✅ Top-level await support
- ✅ `import.meta.url` available

## Scripts

- `npm run build` - Run the build script with inquirer prompts
- `npm run verify` - Verify ESM configuration is working

## Adding New Build Scripts

Create new `.ts` files in this folder using ESM syntax:

```typescript
import inquirer from 'inquirer';
import { readFile } from 'fs/promises';

// Your code here with top-level await
const answers = await inquirer.prompt([...]);
```

All imports must include file extensions when importing local files:

```typescript
// ✅ Correct
import { helper } from './utils.js';

// ❌ Wrong
import { helper } from './utils';
```

Note: Even for `.ts` files, use `.js` extension in imports (TypeScript will resolve them correctly).
