# Angular Library Path Resolution Solution

## Problem
When an Angular library uses absolute path mappings (e.g., `@my-lib/core`, `@shared/utils`) in `tsconfig.base.json`, consuming applications can't resolve these paths, causing TypeScript errors.

## Solutions

### Solution 1: Transform Paths During Build (Recommended)
Transform absolute paths to relative imports during the build process so the published library doesn't contain path mappings.

### Solution 2: Configure Consuming App
Add matching path mappings to the consuming application's `tsconfig.json`.

### Solution 3: Use TypeScript Path Mapping Plugin
Use a build tool that resolves paths during compilation.
