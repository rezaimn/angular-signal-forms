# Before & After Comparison

## BEFORE: Custom Service Worker

### Custom service-worker.js
```javascript
importScripts('https://prod.webpu.sh/bn1pE2-2yK9oE5rs4x0PgW2ZklPBAMEM/service-worker-source.js');

'use strict';
// cacheVersion
const cacheVersion = '25.23.0';

// service worker install event
self.addEventListener('install', function (event) {
  console.log('[PWA] Install Event ...');
  self.skipWaiting();
});

// service worker activate event
self.addEventListener('activate', function () {
  console.log('[PWA] Activate Event ...');
});

// service worker fetch event
self.addEventListener('fetch', function (event) {
  event.respondWith(fetch(event.request));
});
```

### Manual Registration (in index.html or app code)
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
```

---

## AFTER: Angular PWA

### 1. ngsw-config.json (Configuration)
```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    }
  ]
}
```

### 2. app.module.ts (Registration)
```typescript
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
})
```

### 3. No Manual Service Worker File Needed
- ✅ Angular generates `ngsw-worker.js` automatically during build
- ✅ Cache versioning handled automatically
- ✅ Intelligent caching strategies built-in
- ✅ Update management handled automatically

---

## Key Differences

| Feature | Custom SW | Angular PWA |
|---------|-----------|-------------|
| Cache Versioning | Manual (`cacheVersion = '25.23.0'`) | Automatic |
| Caching Strategy | Passthrough only | Configurable (prefetch, lazy, freshness) |
| Updates | Manual handling | Automatic with update checks |
| Offline Support | None | Built-in |
| Configuration | Code changes | JSON config file |
| Build Integration | Separate | Integrated with Angular build |
