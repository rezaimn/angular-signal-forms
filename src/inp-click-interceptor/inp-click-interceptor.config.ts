import { InjectionToken, Provider } from '@angular/core';

export interface InpClickInterceptorConfig {
  /**
   * CSS selectors to match using `event.target.closest(...)`.
   * If empty/omitted, the interceptor does nothing.
   */
  selectors: string[];

  /**
   * How many animation frames to yield before re-dispatching the click.
   * Your snippet used 2 (`requestAnimationFrame` twice).
   */
  yieldFrames?: number;

  /**
   * Class added to the matched element while yielding.
   * Use this for a pulse animation + `pointer-events: none`.
   */
  loadingClass?: string;

  /**
   * How long to keep `loadingClass` after re-dispatching.
   */
  loadingTimeoutMs?: number;

  /**
   * When true, logs timing + actions to the console.
   */
  debug?: boolean;
}

export const INP_CLICK_INTERCEPTOR_CONFIG = new InjectionToken<InpClickInterceptorConfig>(
  'INP_CLICK_INTERCEPTOR_CONFIG',
  {
    providedIn: 'root',
    factory: () => ({ selectors: [] }),
  },
);

export function provideInpClickInterceptorConfig(
  config: InpClickInterceptorConfig,
): Provider {
  return { provide: INP_CLICK_INTERCEPTOR_CONFIG, useValue: config };
}

