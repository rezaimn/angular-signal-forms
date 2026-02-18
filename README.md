# Angular INP Optimize

Drop-in Angular directives and providers to reduce [Interaction to Next Paint (INP)](https://web.dev/inp/) by intercepting clicks, yielding to the browser for a paint frame, then re-dispatching.

## How it works

1. A **single document-level `capture` listener** intercepts clicks on registered elements/selectors
2. The click is **stopped** and a loading animation is applied
3. A **double `requestAnimationFrame`** yields to the browser so it can paint visual feedback
4. The original click is **re-dispatched** — Angular handlers fire normally
5. The loading class is removed after a configurable timeout

All rAF work runs **outside NgZone** to avoid unnecessary change detection.

## Installation

Copy the `inp-optimize/` folder into your project (e.g. `src/app/shared/inp-optimize/`).

## Usage

### Option 1: Per-element directive

The most Angular-idiomatic approach. Add `inpOptimize` to any element:

```html
<button inpOptimize (click)="onSave()">Save</button>
<a inpOptimize [routerLink]="['/dashboard']">Dashboard</a>
```

Import the directive:

```ts
import { InpOptimizeDirective } from './shared/inp-optimize';

@Component({
  imports: [InpOptimizeDirective],
  template: `<button inpOptimize (click)="save()">Save</button>`,
})
export class MyComponent {}
```

### Option 2: Container directive with selectors

Intercept clicks on descendants matching CSS selectors, scoped to a container:

```html
<main inpOptimizeContainer
      [inpSelectors]="['a.link-teaser', '.game', '[label=main-header-login-button]']">
  <!-- all matching descendants get INP optimization -->
</main>
```

Set `[inpScoped]="false"` to match anywhere in the document instead of just descendants.

### Option 3: Global provider (drop-in replacement for `<script>`)

Register selectors at the app level — no template changes needed:

```ts
import { provideInpOptimizeGlobal } from './shared/inp-optimize';

bootstrapApplication(AppComponent, {
  providers: [
    provideInpOptimizeGlobal({
      debug: true,
      selectors: [
        '[label="main-header-register-button"]',
        '[label="main-header-login-button"]',
        'div.item.item-notification',
        '[class="game is-1x1"]',
        'figure.game.is-2x1',
        'a.link.link-teaser.ng-star-inserted',
        'a.tab.link.link-navigation-bottom-bar',
      ],
    }),
  ],
});
```

### Configuration

All options are optional:

| Option           | Default        | Description                                       |
| ---------------- | -------------- | ------------------------------------------------- |
| `debug`          | `false`        | Log interception events to console                |
| `loadingClass`   | `'inp-loading'`| CSS class applied during the yield phase          |
| `loadingDuration`| `2000`         | Ms to keep the loading class after re-dispatch    |

Provide config without global selectors using `provideInpOptimize()`:

```ts
provideInpOptimize({ debug: true, loadingDuration: 1500 })
```

### Mixing approaches

All three approaches can be combined. The service maintains a single document-level listener and merges registered elements and selector entries.

## Migrating from the inline script

1. Remove the `<script>` and `<style>` blocks from `index.html`
2. Choose one of the three approaches above
3. The styles are injected dynamically by the service — no manual CSS needed

## API Surface

| Export                          | Type        | Purpose                                  |
| ------------------------------- | ----------- | ---------------------------------------- |
| `InpOptimizeDirective`          | Directive   | Per-element `[inpOptimize]`              |
| `InpOptimizeContainerDirective` | Directive   | Selector-based `[inpOptimizeContainer]`  |
| `InpOptimizeService`            | Service     | Core service (usually not used directly) |
| `provideInpOptimize()`          | Function    | Config-only provider                     |
| `provideInpOptimizeGlobal()`    | Function    | Global selector provider                 |
| `INP_OPTIMIZE_CONFIG`           | Token       | DI token for config override             |
| `INP_OPTIMIZE_DEFAULTS`         | Const       | Default config values                    |
