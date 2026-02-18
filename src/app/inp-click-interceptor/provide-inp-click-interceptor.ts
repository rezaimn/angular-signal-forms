import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import {
  DEFAULT_INP_CLICK_INTERCEPTOR_CONFIG,
  INP_CLICK_INTERCEPTOR_CONFIG,
  InpClickInterceptorConfig,
} from './inp-click-interceptor.config';
import { InpClickInterceptorService } from './inp-click-interceptor.service';

export type InpClickInterceptorOptions = Partial<InpClickInterceptorConfig>;

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
  return {
    ...DEFAULT_INP_CLICK_INTERCEPTOR_CONFIG,
    ...options,
  };
}
