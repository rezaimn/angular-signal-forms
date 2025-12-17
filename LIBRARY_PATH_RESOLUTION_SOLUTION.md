# Fixing TypeScript Path Resolution in Published Angular Libraries

## The Problem

When you publish an Angular library that uses TypeScript path mappings (like `@api/crud`, `@domains/cats/models`), consuming applications can't resolve these paths because they only exist in your development workspace's `tsconfig.base.json`.

## Solutions

### Option 1: Bundle All Internal Dependencies (Recommended)

Configure your library's `ng-package.json` or build configuration to ensure all internal dependencies are properly bundled.

#### For ng-packagr (Angular libraries):

**Update `ng-package.json` in your library:**

```json
{
  "$schema": "node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/libs/your-library",
  "lib": {
    "entryFile": "src/index.ts",
    "umdModuleIds": {
      "@api/crud": "@api/crud",
      "@domains/cats/models": "@domains/cats/models"
    }
  },
  "allowedNonPeerDependencies": [
    "@api/crud",
    "@domains/cats/models"
  ]
}
```

However, this alone won't fix it. The real issue is that **internal monorepo dependencies should not be external to your library**.

### Option 2: Move Shared Code Into the Library

If code from `@api/crud` or `@domains/cats/models` is needed by your library:

1. **Copy/move the shared code** into your library's internal structure
2. **Use relative imports** within your library
3. **Export only what's needed** from your library's public API

**Example structure:**
```
libs/your-library/
├── src/
│   ├── lib/
│   │   ├── models/          // Moved from @domains/cats/models
│   │   ├── services/
│   │   │   ├── crud.service.ts  // Moved from @api/crud
│   │   └── your-component/
│   └── index.ts             // Public API
```

**Use relative imports:**
```typescript
// Instead of:
import { CrudApiHttpService } from '@api/crud';
import { CatDto } from '@domains/cats/models';

// Use:
import { CrudApiHttpService } from '../services/crud.service';
import { CatDto } from '../models/cat.dto';
```

### Option 3: Publish Dependencies as Separate npm Packages

If the shared code is substantial:

1. **Publish `@api/crud` and `@domains/cats/models` as separate npm packages**
2. **Add them as dependencies** in your library's `package.json`
3. **Use npm imports** instead of path mappings

**Library's package.json:**
```json
{
  "name": "@your-scope/your-library",
  "dependencies": {
    "@your-scope/api-crud": "^1.0.0",
    "@your-scope/cats-models": "^1.0.0"
  }
}
```

**In your code:**
```typescript
import { CrudApiHttpService } from '@your-scope/api-crud';
import { CatDto } from '@your-scope/cats-models';
```

### Option 4: Create Secondary Entry Points

If your library has multiple concerns, use Angular's secondary entry points:

```
libs/your-library/
├── src/index.ts              // Main entry
├── models/
│   ├── public-api.ts
│   └── package.json          // {"ngPackage": {...}}
├── services/
│   ├── public-api.ts
│   └── package.json
└── ng-package.json
```

Consumers can then import:
```typescript
import { CatDto } from '@your-scope/your-library/models';
import { CrudService } from '@your-scope/your-library/services';
```

### Option 5: Use tsconfig paths in the Library's Build Config

**Create a library-specific `tsconfig.lib.prod.json`:**

```json
{
  "extends": "./tsconfig.lib.json",
  "compilerOptions": {
    "paths": {}  // Clear all path mappings for production build
  }
}
```

**Update your build command** to use relative paths before building:

```bash
# Build script that transforms imports
nx build your-library --configuration=production
```

You may need to create a custom build script that transforms the imports before building.

## Recommended Approach

**For your specific case**, I recommend **Option 2 + Option 3 combination**:

1. **Identify which dependencies are truly needed** by your published library
2. **For small shared code**: Copy it into your library and use relative imports
3. **For substantial shared modules**: Publish them as separate packages and reference them as peer dependencies

## Quick Fix Script

Here's a script to find all non-relative imports in your library:

```bash
# Find all absolute path imports
grep -r "from ['\"]@api\\|@domains" libs/your-library/src/ --include="*.ts"
```

## Migration Steps

1. **Audit your imports:**
   ```bash
   grep -r "from ['\"]\@" libs/your-library/src/ --include="*.ts" | grep -v "node_modules"
   ```

2. **For each import, decide:**
   - Should this be bundled into the library? → Use relative imports
   - Should this be a separate package? → Publish separately
   - Is this Angular/third-party? → Add as peer dependency

3. **Update imports systematically:**
   - Use IDE refactoring tools to change imports
   - Or use a script to replace them

4. **Test the build:**
   ```bash
   nx build your-library
   ```

5. **Test in a consuming app:**
   - Install the built library
   - Ensure no TypeScript errors
   - Run the consuming app

## Prevention

To prevent this in the future:

1. **Keep libraries self-contained** - minimize cross-library dependencies
2. **Use barrel exports** (`index.ts`) for clean public APIs  
3. **Regularly test builds** in isolation
4. **Use peer dependencies** for shared Angular/external packages
5. **Document required setup** if path mappings are absolutely necessary

## Example: Refactoring a Component

**Before (with path mappings):**
```typescript
// libs/your-library/src/lib/my.component.ts
import { CatsApiHttpService } from '@fusion.frontend/nx-playground/libs/domains/cats/data-access/src/lib/http/cats-http.service';
import { CrudApiHttpService } from '@api/crud';
import { CatDto } from '@domains/cats/models';
```

**After (self-contained):**
```typescript
// libs/your-library/src/lib/my.component.ts
import { CatsApiHttpService } from './services/cats-api-http.service';
import { CrudApiHttpService } from './services/crud-api-http.service';
import { CatDto } from './models/cat.dto';
```

Or if published as separate packages:
```typescript
import { CatsApiHttpService } from '@your-scope/cats-api';
import { CrudApiHttpService } from '@your-scope/crud-api';
import { CatDto } from '@your-scope/cats-models';
```
