# angular-signal-forms

This repo currently contains a small, Angular-friendly implementation of an **INP click interceptor** (ported from an `index.html` click-capture snippet).

## What you get

- **Global interceptor (best match for your current snippet)**: one capture-phase `document` listener that matches configurable CSS selectors, yields for paint (`requestAnimationFrame` x2 by default), then re-dispatches the click.
- **Optional per-element directive**: for cases where you *do* want to opt-in on specific buttons/links.
- **SSR-safe**: it no-ops unless running in the browser.
- **Runs outside Angular zone**: avoids extra change detection while intercepting/replaying.

## Files

- `src/inp-click-interceptor/inp-click-interceptor.service.ts`
- `src/inp-click-interceptor/inp-click-interceptor.config.ts`
- `src/inp-click-interceptor/provide-inp-click-interceptor.ts`
- `src/inp-click-interceptor/inp-yield-click.directive.ts`
- `src/inp-click-interceptor/inp-click-interceptor.css`

## Use in an Angular app

### 1) Add the CSS (global)

Copy the contents of `src/inp-click-interceptor/inp-click-interceptor.css` into your global stylesheet (typically `src/styles.css` / `src/styles.scss`).

### 2) Wire up the global interceptor

In a standalone bootstrap (`main.ts`):

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideInpClickInterceptor,
  provideInpClickInterceptorConfig,
} from './src/inp-click-interceptor/public-api';

bootstrapApplication(AppComponent, {
  providers: [
    provideInpClickInterceptorConfig({
      selectors: [
        '[label="main-header-register-button"]',
        '[label="main-header-login-button"]',
        'div.item.item-notification',
        '[class="game is-1x1"]',
        'figure.game.is-2x1',
        '[label="login-modal-close"]',
        'a.link.link-teaser.ng-star-inserted',
        'a.tab.link.link-navigation-bottom-bar',
        'a.ng-tns-c2931810325-4.mtx-btn.mtx-btn-primary.mode-block.ng-star-inserted',
      ],
      debug: false,
      yieldFrames: 2,
      loadingClass: 'inp-loading',
      loadingTimeoutMs: 2000,
    }),
    ...provideInpClickInterceptor(),
  ],
});
```

In an `NgModule` app (`AppModule`):

```ts
import { NgModule } from '@angular/core';
import {
  provideInpClickInterceptor,
  provideInpClickInterceptorConfig,
} from './src/inp-click-interceptor/public-api';

@NgModule({
  providers: [
    provideInpClickInterceptorConfig({ selectors: ['a.some-selector'] }),
    ...provideInpClickInterceptor(),
  ],
})
export class AppModule {}
```

#### Note on `routerLink`

- **It works fine with `routerLink`** because the router navigates from its click handler; the first click is stopped, then the replayed click triggers navigation after your paint yield.
- **Avoid selector matching like `[routerLink]`** as a way to target elements: in production builds Angular may not leave that attribute in the DOM (especially when using `[routerLink]="..."`). Prefer stable hooks like `label="..."`, `data-*`, or add `inpYieldClick` to the elements you want to intercept.

### 3) Optional: per-element directive (opt-in)

```ts
import { Component } from '@angular/core';
import { InpYieldClickDirective } from './src/inp-click-interceptor/public-api';

@Component({
  standalone: true,
  imports: [InpYieldClickDirective],
  template: `<a inpYieldClick href="/login">Login</a>`,
})
export class ExampleComponent {}
```
