import { InjectionToken } from '@angular/core';

export interface InpOptimizeConfig {
  /** Enable debug logging to console. Default: false */
  debug?: boolean;
  /** CSS class applied during the yield phase. Default: 'inp-loading' */
  loadingClass?: string;
  /** Duration (ms) to keep the loading class after re-dispatch. Default: 2000 */
  loadingDuration?: number;
}

export interface InpOptimizeGlobalConfig extends InpOptimizeConfig {
  /** CSS selectors to intercept globally at the document level */
  selectors: string[];
}

export const INP_OPTIMIZE_DEFAULTS: Required<InpOptimizeConfig> = {
  debug: false,
  loadingClass: 'inp-loading',
  loadingDuration: 2000,
};

export const INP_OPTIMIZE_CONFIG = new InjectionToken<InpOptimizeConfig>(
  'INP_OPTIMIZE_CONFIG',
);
