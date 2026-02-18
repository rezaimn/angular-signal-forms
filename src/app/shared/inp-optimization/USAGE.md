# INP Optimization – Angular Usage

## Setup

### 1. Import styles

In your global styles (`styles.scss` or `angular.json` styles array):

```scss
@import './app/shared/inp-optimization/inp-optimization.styles';
```

Or add to `angular.json`:

```json
"styles": [
  "src/app/shared/inp-optimization/inp-optimization.styles.scss"
]
```

### 2. Choose approach

---

## Approach A: Directive (explicit, recommended for new code)

Import the directive and use it on any clickable element:

```ts
// In your component
import { InpOptimizeDirective } from './shared/inp-optimization';

@Component({
  standalone: true,
  imports: [InpOptimizeDirective],
  template: `
    <button inpOptimize>Register</button>
    <a href="/login" inpOptimize>Login</a>
    <div inpOptimize (click)="doSomething()">Click me</div>
  `,
})
export class MyComponent {}
```

Disable on specific element:

```html
<button [inpOptimize]="false">Skip optimization</button>
```

---

## Approach B: Global service (document-level, like your original script)

Use when you have dynamic/third-party content or prefer central config.

**app.config.ts** (Angular 17+):

```ts
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { InpOptimizationService } from './shared/inp-optimization';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (inp: InpOptimizationService) => () => inp.init(),
      deps: [InpOptimizationService],
      multi: true,
    },
  ],
};
```

**main.ts** (if using module):

```ts
import { InpOptimizationService } from './app/shared/inp-optimization';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((ref) => {
    ref.injector.get(InpOptimizationService).init();
  });
```

---

## Custom config

Provide your own selectors, loading class, or duration:

```ts
import { provideAppInitializer } from '@angular/core';
import {
  INP_OPTIMIZATION_CONFIG,
  InpOptimizationService,
} from './shared/inp-optimization';

// In app.config.ts providers:
{
  provide: INP_OPTIMIZATION_CONFIG,
  useValue: {
    selectors: [
      '[label="main-header-register-button"]',
      '[label="main-header-login-button"]',
      '.my-custom-clickable',
    ],
    loadingClass: 'inp-loading',
    loadingDuration: 2000,
    debug: true, // set false for production
  },
},
{
  provide: APP_INITIALIZER,
  useFactory: (inp: InpOptimizationService) => () => inp.init(),
  deps: [InpOptimizationService],
  multi: true,
},
```

---

## Extend selectors at runtime

```ts
constructor(private inp: InpOptimizationService) {
  this.inp.addSelectors('[data-inp-optimize]');
  this.inp.init(); // if not using APP_INITIALIZER
}
```

---

## Both approaches

You can use the directive on explicit elements **and** the service for document-level interception. Elements with the directive will be handled by the directive; other matching elements will be handled by the service. Avoid applying both to the same element (no harm, but redundant).
