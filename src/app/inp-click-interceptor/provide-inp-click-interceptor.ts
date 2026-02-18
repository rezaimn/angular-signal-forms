import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import {
  DEFAULT_INP_CLICK_INTERCEPTOR_CONFIG,
  INP_CLICK_INTERCEPTOR_CONFIG,
  InpClickInterceptorConfig,
} from './inp-click-interceptor.config';
import { InpClickInterceptorService } from './inp-click-interceptor.service';

export interface InpClickInterceptorOptions extends Partial<Omit<InpClickInterceptorConfig, 'selectors'>> {
  /**
   * Additional selectors appended to the defaults.
   */
  selectors?: readonly string[];
  /**
   * Fully replace all default selectors.
   */
  replaceSelectors?: readonly string[];
}

export function provideInpClickInterceptor(options: InpClickInterceptorOptions = {}): EnvironmentProviders {
  const mergedConfig = mergeConfig(options);

  return makeEnvironmentProviders([
    {
      provide: INP_CLICK_INTERCEPTOR_CONFIG,
      useValue: mergedConfig,
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: initializeInpClickInterceptor,
      deps: [InpClickInterceptorService],
    },
  ]);
}

function initializeInpClickInterceptor(service: InpClickInterceptorService): () => void {
  return () => service.init();
}

function mergeConfig(options: InpClickInterceptorOptions): InpClickInterceptorConfig {
  const { replaceSelectors, selectors: additionalSelectors, ...baseOptions } = options;
  const selectorSource = replaceSelectors
    ? replaceSelectors
    : [...DEFAULT_INP_CLICK_INTERCEPTOR_CONFIG.selectors, ...(additionalSelectors ?? [])];

  return {
    ...DEFAULT_INP_CLICK_INTERCEPTOR_CONFIG,
    ...baseOptions,
    selectors: dedupeAndNormalizeSelectors(selectorSource),
  };
}

function dedupeAndNormalizeSelectors(selectors: readonly string[]): readonly string[] {
  const normalized = selectors
    .map((selector) => selector.trim())
    .filter((selector) => selector.length > 0);

  return [...new Set(normalized)];
}
