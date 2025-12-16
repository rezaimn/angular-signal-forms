# Testing Angular PWA Service Workers Locally

## Quick Start

Service workers only work over **HTTPS** or **localhost**. Here are the main approaches:

### Method 1: Using `ng serve` (Development)

```bash
# Build with service worker enabled
ng build --configuration production

# Serve the production build locally
npx http-server dist/your-app-name -p 4200 -c-1
# -c-1 disables caching (important for testing updates)
```

### Method 2: Using Angular CLI with Service Worker

```bash
# Add PWA support if not already added
ng add @angular/pwa

# Serve with service worker (requires production build)
ng serve --configuration production
```

### Method 3: Using `http-server` (Recommended for Testing)

```bash
# Install http-server globally (optional)
npm install -g http-server

# Build your app
ng build --configuration production

# Serve with no caching
cd dist/your-app-name
http-server -p 4200 -c-1 --proxy http://localhost:4200?
```

## Testing Checklist

### 1. Verify Service Worker Registration
- Open Chrome DevTools → Application → Service Workers
- Check that your service worker is registered and active
- Look for any errors in the Console

### 2. Test Offline Functionality
- Open DevTools → Network → Check "Offline"
- Refresh the page - should still load from cache
- Navigate to different routes - should work offline

### 3. Test Cache Updates
- Make changes to your app
- Rebuild: `ng build --configuration production`
- Hard refresh (Ctrl+Shift+R) or use "Update on reload" in DevTools
- Check that new version is served

### 4. Test Update Flow
- Load app in browser
- Make changes and rebuild
- In DevTools → Application → Service Workers → Click "Update"
- Or wait for automatic update check (default: every 6 hours)

### 5. Inspect Cached Resources
- DevTools → Application → Cache Storage
- View what's cached by your service worker
- Verify expected files are present

## Common Issues

### Service Worker Not Registering
- Ensure you're on `localhost` or `https`
- Check `ngsw-config.json` is configured correctly
- Verify `ServiceWorkerModule` is imported in `app.module.ts`

### Updates Not Working
- Clear cache: DevTools → Application → Clear storage
- Unregister service worker: DevTools → Application → Service Workers → Unregister
- Hard refresh (Ctrl+Shift+R)

### Testing Update Scenarios
- Use DevTools → Application → Service Workers → "Update on reload"
- Or manually trigger update via `SwUpdate.checkForUpdate()`

## Debugging Tips

1. **Check Console**: Service worker errors appear in the main console
2. **Service Worker Console**: DevTools → Application → Service Workers → Click "inspect" for dedicated console
3. **Network Tab**: Verify requests are intercepted by service worker (look for "(ServiceWorker)" label)
4. **Application Tab**: Inspect cache storage, service worker status, and storage

## Testing Update Flow Programmatically

```typescript
import { SwUpdate } from '@angular/service-worker';

constructor(private swUpdate: SwUpdate) {
  // Check for updates
  this.swUpdate.checkForUpdate();
  
  // Listen for available updates
  this.swUpdate.versionUpdates.subscribe(event => {
    if (event.type === 'VERSION_READY') {
      // Reload to activate new version
      window.location.reload();
    }
  });
}
```
