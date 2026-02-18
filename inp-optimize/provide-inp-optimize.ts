import {
  ENVIRONMENT_INITIALIZER,
  inject,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';
import {
  INP_OPTIMIZE_CONFIG,
  type InpOptimizeConfig,
  type InpOptimizeGlobalConfig,
} from './inp-optimize.config';
import { InpOptimizeService } from './inp-optimize.service';

/**
 * Provide INP optimization configuration.
 *
 * Use this when you only need the directive-based approach and
 * want to override defaults (debug, loadingClass, loadingDuration).
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideInpOptimize({ debug: true, loadingDuration: 1500 }),
 *   ],
 * });
 * ```
 */
export function provideInpOptimize(
  config: InpOptimizeConfig = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: INP_OPTIMIZE_CONFIG, useValue: config },
  ]);
}

/**
 * Provide INP optimization with global CSS-selector interception.
 *
 * This is the direct Angular replacement for the inline `<script>` approach.
 * It registers a document-level capture listener that intercepts clicks
 * on elements matching the given selectors — no directives needed.
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideInpOptimizeGlobal({
 *       debug: true,
 *       selectors: [
 *         '[label="main-header-register-button"]',
 *         '[label="main-header-login-button"]',
 *         'div.item.item-notification',
 *         '[class="game is-1x1"]',
 *         'figure.game.is-2x1',
 *         'a.link.link-teaser.ng-star-inserted',
 *         'a.tab.link.link-navigation-bottom-bar',
 *       ],
 *     }),
 *   ],
 * });
 * ```
 */
export function provideInpOptimizeGlobal(
  config: InpOptimizeGlobalConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: INP_OPTIMIZE_CONFIG, useValue: config },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        inject(InpOptimizeService).registerSelectors(config.selectors);
      },
    },
  ]);
}
