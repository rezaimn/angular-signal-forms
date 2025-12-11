# Migration Guide: Custom Service Worker → Angular PWA

## Steps to Replace Custom Service Worker with @angular/pwa

### 1. Install @angular/pwa
```bash
ng add @angular/pwa
```

This command will:
- Install `@angular/service-worker` and `@angular/pwa`
- Create `ngsw-config.json`
- Update `angular.json` with service worker configuration
- Create `manifest.webmanifest`
- Update `index.html` with manifest link

### 2. Configure Service Worker (ngsw-config.json)

The `ngsw-config.json` file will be created automatically. You may need to customize it based on your needs.

### 3. Register Service Worker in app.module.ts

Update your `app.module.ts`:
```typescript
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    // ... other imports
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  // ...
})
```

### 4. Remove Custom Service Worker

- Delete your custom service worker file (the one with `importScripts('https://prod.webpu.sh/...')`)
- Remove any references to it in `index.html` or other files
- Remove any manual service worker registration code

### 5. Build for Production

Angular PWA only works in production builds:
```bash
ng build --configuration production
```

The service worker will be automatically generated during the build process.

## Important Notes

- Angular PWA service worker only works in production mode
- The service worker file (`ngsw-worker.js`) is generated during build
- Update `ngsw-config.json` to configure caching strategies
- The cache version is managed automatically by Angular PWA
- You can still use webpu.sh if needed, but it should be configured in `ngsw-config.json` as an external resource

## Handling webpu.sh Script

If you need to keep using the webpu.sh script, you have two options:

### Option 1: Include as External Resource in ngsw-config.json
Add it to your `dataGroups` or `assetGroups`:

```json
{
  "dataGroups": [
    {
      "name": "webpush",
      "urls": [
        "https://prod.webpu.sh/**"
      ],
      "cacheConfig": {
        "strategy": "freshness",
        "maxAge": "1d"
      }
    }
  ]
}
```

### Option 2: Load in index.html
Add the script directly in your `index.html`:

```html
<script src="https://prod.webpu.sh/bn1pE2-2yK9oE5rs4x0PgW2ZklPBAMEM/service-worker-source.js"></script>
```

However, note that Angular PWA's service worker will handle caching, so you may not need the webpu.sh service worker script anymore.

## What Gets Replaced

Your custom service worker:
- ❌ Manual cache version management (`cacheVersion = '25.23.0'`)
- ❌ Manual install/activate event handlers
- ❌ Simple fetch passthrough
- ❌ External script import from webpu.sh

Angular PWA provides:
- ✅ Automatic cache versioning
- ✅ Intelligent caching strategies
- ✅ Automatic updates
- ✅ Offline support
- ✅ Configurable caching rules via `ngsw-config.json`
