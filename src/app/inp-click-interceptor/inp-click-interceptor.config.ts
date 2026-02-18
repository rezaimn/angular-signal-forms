import { InjectionToken } from '@angular/core';

export interface InpClickInterceptorConfig {
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
