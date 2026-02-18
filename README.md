# angular-signal-forms

## INP click-yield interceptor (Angular version)

This repository now includes a reusable Angular implementation of your `index.html` INP workaround as:

- `InpClickInterceptorService` (global click capture + click replay)
- `provideInpClickInterceptor(...)` (bootstrap-time setup + config)
- `InpClickYieldDirective` (template opt-in via `data-inp-intercept`; no `label` selectors)

### Files

- `src/app/inp-click-interceptor/inp-click-interceptor.config.ts`
- `src/app/inp-click-interceptor/inp-click-interceptor.service.ts`
- `src/app/inp-click-interceptor/inp-click-yield.directive.ts`
- `src/app/inp-click-interceptor/provide-inp-click-interceptor.ts`

### 1) Enable globally in `app.config.ts`

```ts
import { ApplicationConfig } from '@angular/core';
import { provideInpClickInterceptor } from './inp-click-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideInpClickInterceptor({
      debug: false,
      yieldFrames: 2,
    }),
  ],
};
```

`Interceptor ready` is always logged once in the console. Set `debug: true` to also see detailed interception/replay logs.

No extra bootstrap/app-init wiring is required beyond this provider. `provideInpClickInterceptor(...)` already registers an `APP_INITIALIZER` internally.

If your app is NgModule-based (non-standalone), add it to `AppModule.providers`:

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideInpClickInterceptor } from './inp-click-interceptor';

@NgModule({
  imports: [BrowserModule],
  providers: [provideInpClickInterceptor({ debug: false, yieldFrames: 2 })],
})
export class AppModule {}
```

### 2) Opt-in per element with directive

```ts
import { Component } from '@angular/core';
import { InpClickYieldDirective } from './inp-click-interceptor';

@Component({
  standalone: true,
  selector: 'app-example',
  imports: [InpClickYieldDirective],
  template: `
    <a inpClickYield href="/games">Open games</a>
    <button inpClickYield>High-priority click</button>
  `,
})
export class ExampleComponent {}
```

You can use it with both `href` and `routerLink`:

```html
<a inpClickYield routerLink="/games">Games (routerLink)</a>
<button inpClickYield [routerLink]="['/profile', userId]">Profile (routerLink)</button>
<a inpClickYield href="/terms">Terms (plain href)</a>
```

The interceptor does not depend on `href`; it defers and replays the click, so Angular's `routerLink` handlers still run normally.

### 3) Remove raw script/style from `index.html`

The interceptor starts via Angular bootstrap provider and only intercepts elements where `inpClickYield` is applied.

### 4) Add styles globally (`styles.css` + `angular.json`)

The loading animation is now in `src/styles.css`:

```css
@keyframes inp-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.inp-loading {
  animation: inp-pulse 0.8s ease-in-out infinite;
  pointer-events: none !important;
}
```

In your Angular app, ensure `src/styles.css` is loaded in `angular.json`:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": ["src/styles.css"]
          }
        }
      }
    }
  }
}
```

If you override `loadingClass` in `provideInpClickInterceptor(...)`, add matching CSS for that class.
