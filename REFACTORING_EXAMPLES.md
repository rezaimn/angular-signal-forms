# ESM Refactoring Examples

This document shows real-world refactoring examples for converting your build scripts to ESM.

## Example 1: Basic Config Loader

### Before (CommonJS)

```typescript
// tools/config/loader.ts
const fs = require('fs');
const path = require('path');

const configDir = path.join(__dirname, 'configs');

function loadConfig(site: string) {
  const configPath = path.join(configDir, `${site}.json`);
  const content = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(content);
}

module.exports = { loadConfig };
```

### After (ESM)

```typescript
// tools/config/loader.ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configDir = join(__dirname, 'configs');

export async function loadConfig(site: string) {
  const configPath = join(configDir, `${site}.json`);
  const content = await readFile(configPath, 'utf-8');
  return JSON.parse(content);
}

// Or import JSON directly:
// import config from './configs/aduk.json' assert { type: 'json' };
```

## Example 2: CLI Script with Inquirer

### Before (CommonJS)

```typescript
// tools/build/build.ts
const inquirer = require('inquirer');
const { buildProject } = require('./builder');
const { runPreScripts } = require('./pre-scripts');

async function main() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'site',
      message: 'Select site:',
      choices: ['aduk', 'site2'],
    },
  ]);

  await runPreScripts(answers);
  await buildProject(answers);
}

main();
```

### After (ESM)

```typescript
// tools/build/build.ts
import inquirer from 'inquirer';
import { buildProject } from './builder.js';
import { runPreScripts } from './pre-scripts.js';

async function main() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'site',
      message: 'Select site:',
      choices: ['aduk', 'site2'],
    },
  ]);

  await runPreScripts(answers);
  await buildProject(answers);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

## Example 3: Dynamic Module Loading

### Before (CommonJS)

```typescript
// tools/plugins/loader.ts
const fs = require('fs');
const path = require('path');

function loadPlugin(name: string) {
  const pluginPath = path.join(__dirname, 'available', `${name}.js`);
  
  if (!fs.existsSync(pluginPath)) {
    throw new Error(`Plugin ${name} not found`);
  }
  
  return require(pluginPath);
}

module.exports = { loadPlugin };
```

### After (ESM)

```typescript
// tools/plugins/loader.ts
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadPlugin(name: string) {
  const pluginPath = join(__dirname, 'available', `${name}.js`);
  
  try {
    await access(pluginPath);
  } catch {
    throw new Error(`Plugin ${name} not found`);
  }
  
  return await import(pluginPath);
}
```

## Example 4: Environment Configuration

### Before (CommonJS)

```typescript
// tools/config/environment.ts
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:3000',
};

module.exports = config;
```

### After (ESM)

```typescript
// tools/config/environment.ts
import { config as dotenvConfig } from 'dotenv';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenvConfig({ path: join(__dirname, '../../.env') });

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:3000',
};

export default config;
```

## Example 5: Utility Functions Module

### Before (CommonJS)

```typescript
// tools/utils/helpers.ts
const chalk = require('chalk');

function logSuccess(message: string) {
  console.log(chalk.green('✔'), message);
}

function logError(message: string) {
  console.log(chalk.red('✖'), message);
}

exports.logSuccess = logSuccess;
exports.logError = logError;
```

### After (ESM)

```typescript
// tools/utils/helpers.ts
import chalk from 'chalk';

export function logSuccess(message: string) {
  console.log(chalk.green('✔'), message);
}

export function logError(message: string) {
  console.log(chalk.red('✖'), message);
}

// Optional: Add a default export if you want both options
export default {
  logSuccess,
  logError,
};
```

## Example 6: Class-Based Module

### Before (CommonJS)

```typescript
// tools/builder/WebpackBuilder.ts
const webpack = require('webpack');
const path = require('path');

class WebpackBuilder {
  private config: any;
  
  constructor(siteConfig: any) {
    this.config = this.createConfig(siteConfig);
  }
  
  createConfig(siteConfig: any) {
    return {
      entry: path.join(__dirname, '../../src', siteConfig.entry),
      output: {
        path: path.join(__dirname, '../../dist', siteConfig.site),
      },
    };
  }
  
  async build() {
    return new Promise((resolve, reject) => {
      webpack(this.config, (err, stats) => {
        if (err) reject(err);
        else resolve(stats);
      });
    });
  }
}

module.exports = WebpackBuilder;
```

### After (ESM)

```typescript
// tools/builder/WebpackBuilder.ts
import webpack from 'webpack';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class WebpackBuilder {
  private config: any;
  
  constructor(siteConfig: any) {
    this.config = this.createConfig(siteConfig);
  }
  
  createConfig(siteConfig: any) {
    return {
      entry: join(__dirname, '../../src', siteConfig.entry),
      output: {
        path: join(__dirname, '../../dist', siteConfig.site),
      },
    };
  }
  
  async build() {
    return new Promise((resolve, reject) => {
      webpack(this.config, (err, stats) => {
        if (err) reject(err);
        else resolve(stats);
      });
    });
  }
}

export default WebpackBuilder;
```

## Example 7: Pre-Scripts with Child Process

### Before (CommonJS)

```typescript
// tools/build/pre-scripts.ts
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function runNpmCheck() {
  try {
    await execAsync('npm list --depth=0');
    console.log('✔ NPM');
  } catch (error) {
    console.log('✖ NPM');
    throw error;
  }
}

module.exports = { runNpmCheck };
```

### After (ESM)

```typescript
// tools/build/pre-scripts.ts
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function runNpmCheck() {
  try {
    await execAsync('npm list --depth=0');
    console.log('✔ NPM');
  } catch (error) {
    console.log('✖ NPM');
    throw error;
  }
}
```

## Example 8: Multiple Exports Pattern

### Before (CommonJS)

```typescript
// tools/utils/validators.ts
function validateSite(site: string): boolean {
  return ['aduk', 'site2', 'site3'].includes(site);
}

function validateChannel(channel: string): boolean {
  return ['web', 'mobile'].includes(channel);
}

function validateEnvironment(env: string): boolean {
  return ['local', 'dev', 'prod'].includes(env);
}

module.exports = {
  validateSite,
  validateChannel,
  validateEnvironment,
};
```

### After (ESM - Option 1: Named Exports)

```typescript
// tools/utils/validators.ts
export function validateSite(site: string): boolean {
  return ['aduk', 'site2', 'site3'].includes(site);
}

export function validateChannel(channel: string): boolean {
  return ['web', 'mobile'].includes(channel);
}

export function validateEnvironment(env: string): boolean {
  return ['local', 'dev', 'prod'].includes(env);
}
```

### After (ESM - Option 2: Named + Default)

```typescript
// tools/utils/validators.ts
export function validateSite(site: string): boolean {
  return ['aduk', 'site2', 'site3'].includes(site);
}

export function validateChannel(channel: string): boolean {
  return ['web', 'mobile'].includes(channel);
}

export function validateEnvironment(env: string): boolean {
  return ['local', 'dev', 'prod'].includes(env);
}

export default {
  validateSite,
  validateChannel,
  validateEnvironment,
};
```

## Import Pattern Comparison

```typescript
// Named imports (recommended for most cases)
import { validateSite, validateChannel } from './utils/validators.js';

// Default import (use when the module has a clear primary export)
import validators from './utils/validators.js';

// Mixed (both named and default)
import validators, { validateSite } from './utils/validators.js';

// Namespace import (when you want all exports under one object)
import * as validators from './utils/validators.js';

// Side-effect only (for modules that just run code)
import './setup/init.js';

// Dynamic import (for lazy loading)
const { validateSite } = await import('./utils/validators.js');
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting .js extension

```typescript
import { helper } from './utils/helper';  // ❌ Will fail
import { helper } from './utils/helper.js';  // ✅ Correct
```

### ❌ Mistake 2: Using require in ESM

```typescript
const config = require('./config.json');  // ❌ Doesn't work in ESM
import config from './config.json' assert { type: 'json' };  // ✅ Correct
```

### ❌ Mistake 3: Wrong __dirname pattern

```typescript
// ❌ Won't work in ESM
const dir = __dirname;

// ✅ Correct ESM equivalent
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
```

### ❌ Mistake 4: module.exports in ESM

```typescript
module.exports = { something };  // ❌ Won't work
export default { something };  // ✅ Correct
```

### ❌ Mistake 5: Synchronous operations

```typescript
// ❌ Many sync operations don't work well in ESM
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

// ✅ Use async versions
const config = JSON.parse(await readFile('./config.json', 'utf-8'));
// Or use import assertions
import config from './config.json' assert { type: 'json' };
```

## Search and Replace Patterns

Use these find/replace patterns in your editor:

1. **Import node modules:**
   - Find: `const (\w+) = require\('([^']+)'\);`
   - Replace: `import $1 from '$2';`

2. **Import relative modules:**
   - Find: `const \{ ([^}]+) \} = require\('([^']+)'\);`
   - Replace: `import { $1 } from '$2.js';`

3. **Export default:**
   - Find: `module\.exports = ([^;]+);`
   - Replace: `export default $1;`

4. **Named exports:**
   - Find: `exports\.(\w+) = `
   - Replace: `export const $1 = `

Note: These are starting points - review each change manually as context matters!

## Testing Your Migration

After refactoring, create a simple test script:

```typescript
// tools/test-esm.ts
import { validateSite } from './utils/validators.js';
import { loadConfig } from './config/loader.js';
import inquirer from 'inquirer';

console.log('Testing ESM imports...');
console.log('✔ inquirer imported:', typeof inquirer.prompt);
console.log('✔ validateSite imported:', typeof validateSite);
console.log('✔ loadConfig imported:', typeof loadConfig);
console.log('All imports working!');
```

Run with:
```bash
tsx tools/test-esm.ts
```
