import { InjectionToken } from '@angular/core';

/**
 * Configuration for INP (Interaction to Next Paint) optimization.
 * Yields to the browser's paint cycle before re-dispatching clicks,
 * improving responsiveness metrics.
 */
export interface InpOptimizationConfig {
  /** CSS selectors for document-level interception (when using service) */
  selectors: string[];
  /** Class added during optimization, removed after loadingDuration */
  loadingClass: string;
  /** How long to show loading state (ms) */
  loadingDuration: number;
  /** Enable debug logging to console */
  debug: boolean;
}

export const INP_OPTIMIZATION_CONFIG = new InjectionToken<InpOptimizationConfig>(
  'INP_OPTIMIZATION_CONFIG',
  {
    providedIn: 'root',
    factory: () => INP_OPTIMIZATION_DEFAULT_CONFIG,
  }
);

export const INP_OPTIMIZATION_DEFAULT_CONFIG: InpOptimizationConfig = {
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
  loadingClass: 'inp-loading',
  loadingDuration: 2000,
  debug: false,
};
