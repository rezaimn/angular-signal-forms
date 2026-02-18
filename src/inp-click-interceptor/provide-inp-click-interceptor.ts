import { APP_INITIALIZER, Provider } from '@angular/core';
import { InpClickInterceptorService } from './inp-click-interceptor.service';

export function provideInpClickInterceptor(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (svc: InpClickInterceptorService) => () => svc.init(),
      deps: [InpClickInterceptorService],
    },
  ];
}

