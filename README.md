# angular-signal-forms

## INP click-yield interceptor (Angular version)

This repository now includes a reusable Angular implementation of your `index.html` INP workaround as:

- `InpClickInterceptorService` (global click capture + click replay)
- `provideInpClickInterceptor(...)` (bootstrap-time setup + config)
- `InpClickYieldDirective` (template opt-in via `data-inp-intercept`)

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

### 3) Remove raw script/style from `index.html`

The interceptor now injects its own loading style at runtime and starts via Angular bootstrap provider.
It only intercepts elements where `inpClickYield` is applied.
