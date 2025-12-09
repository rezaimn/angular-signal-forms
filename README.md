# angular-signal-forms

Modern ESM-based TypeScript project with inquirer v13 support.

## Quick Start

```bash
# Install dependencies
npm install

# Verify ESM setup is working
npm run verify

# Run build script with interactive prompts
npm run build

# Try advanced inquirer examples
npm run build:advanced
```

## ESM Support

This project uses TypeScript with full ESM (ECMAScript Modules) support, allowing you to use modern packages like inquirer v13 that are ESM-only.

See [ESM_SETUP.md](./ESM_SETUP.md) for detailed documentation on the ESM configuration.

## Build Tools

Build scripts are located in the `tools/` directory. See [tools/README.md](./tools/README.md) for more information.

## Key Configuration

- **package.json**: `"type": "module"` enables ESM
- **tsconfig.json**: `"module": "nodenext"` and `"moduleResolution": "nodenext"` for proper ESM with TypeScript
- **tsx**: Used to run TypeScript files directly with ESM support