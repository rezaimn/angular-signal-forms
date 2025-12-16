# angular-signal-forms

## Test Angular PWA service-worker locally

### Key constraints (so you don’t waste time)
- **`ng serve` is not enough**: the Angular service worker needs a built `ngsw.json` manifest, which is produced by `ng build` (typically prod config).
- **Service workers only register on “secure contexts”**: `https://` or `http://localhost` (localhost is treated as secure).

### Minimal local test loop (recommended)
1. **Build with SW enabled** (usually `production`):

```bash
ng build --configuration production
```

2. **Serve the built `dist/` output from localhost** (disable caching so SW update checks behave):

```bash
npx http-server "dist/<your-app-name>" -p 8080 -c-1
```

3. Open `http://localhost:8080` and verify:
- Chrome DevTools → **Application** → **Service Workers**: see `ngsw-worker.js` registered.
- DevTools → **Network**: confirm `ngsw.json` is fetched (and not stuck behind cache).

### Test offline + caching behavior
- DevTools → **Application** → **Service Workers**:
  - Check **Offline** (or DevTools → Network → “Offline”).
  - Reload and confirm the app still loads (depends on what you cached in `ngsw-config.json`).

### Test update flow (the part people get wrong)
Angular SW updates are **two-phase** (download new version, then activate on next navigation).

1. Make a change that affects built assets (e.g. change a component template).
2. Rebuild:

```bash
ng build --configuration production
```

3. Refresh the page once to let it fetch the new version in the background.
4. Refresh again (or close/reopen the tab) to activate the new version.

If you need to force it while debugging:
- DevTools → Application → Service Workers → **Update** (triggers update check)
- DevTools → Application → Storage → **Clear site data** (nuclear reset)
- Or temporarily bypass the SW: add `?ngsw-bypass=true` to the URL.

### Turn on verbose SW logs
In the browser console:

```js
localStorage.setItem('ngsw:debug', 'true');
location.reload();
```

To turn off:

```js
localStorage.removeItem('ngsw:debug');
location.reload();
```

### Testing on a phone (LAN URLs need HTTPS)
`http://192.168.x.y:8080` is **not** a secure context, so the SW won’t register. Options:
- **Use a tunnel with HTTPS** (fastest): `ngrok http 8080` and open the `https://...` URL.
- **Local HTTPS with mkcert** (best long-term): generate a trusted cert and serve `dist/` over HTTPS.

### Common gotchas
- **Cached `ngsw.json` / `ngsw-worker.js` breaks updates**: serve with `Cache-Control: no-store` or use `http-server -c-1`.
- **SW not enabled in config**: ensure `angular.json` build config has:
  - `"serviceWorker": true`
  - `"ngswConfigPath": "ngsw-config.json"`
- **One SW per scope**: old registrations can stick—unregister in DevTools if behavior seems “haunted”.