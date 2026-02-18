import { InjectionToken } from '@angular/core';

/**
 * Default selectors copied from the existing index.html implementation.
 * Includes [data-inp-intercept] so templates can opt in via a directive.
 */
export const DEFAULT_INP_CLICK_INTERCEPTOR_SELECTORS: readonly string[] = [
  '[label="main-header-register-button"]',
  '[label="main-header-login-button"]',
  'div.item.item-notification',
  '[class="game is-1x1"]',
  'figure.game.is-2x1',
  '[label="login-modal-close"]',
  'a.link.link-teaser.ng-star-inserted',
  'a.tab.link.link-navigation-bottom-bar',
  'a.ng-tns-c2931810325-4.mtx-btn.mtx-btn-primary.mode-block.ng-star-inserted',
  '[data-inp-intercept]',
];

export interface InpClickInterceptorConfig {
  /**
   * CSS selectors that should be intercepted.
   */
  selectors: readonly string[];
  /**
   * Enable debug logs in the browser console.
   */
  debug: boolean;
  /**
   * Class applied while the click is deferred.
   */
  loadingClass: string;
  /**
   * Delay (ms) before removing the loading class.
   */
  loadingClassRemovalDelayMs: number;
  /**
   * Number of requestAnimationFrame hops before replaying the click.
   * 2 is the original behavior from index.html.
   */
  yieldFrames: number;
}

export const DEFAULT_INP_CLICK_INTERCEPTOR_CONFIG: InpClickInterceptorConfig = {
  selectors: DEFAULT_INP_CLICK_INTERCEPTOR_SELECTORS,
  debug: false,
  loadingClass: 'inp-loading',
  loadingClassRemovalDelayMs: 2000,
  yieldFrames: 2,
};

export const INP_CLICK_INTERCEPTOR_CONFIG = new InjectionToken<InpClickInterceptorConfig>(
  'INP_CLICK_INTERCEPTOR_CONFIG',
  {
    providedIn: 'root',
    factory: () => DEFAULT_INP_CLICK_INTERCEPTOR_CONFIG,
  },
);
