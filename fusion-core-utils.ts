import {
  signal,
  inject,
  PLATFORM_ID,
  Injector,
  runInInjectionContext,
  effect,
  makeStateKey,
  TransferState,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import {
  timeout,
  distinctUntilChanged,
  filter,
  switchMap,
  takeUntil,
  map,
  catchError,
  take,
} from 'rxjs/operators';
import * as uuidModule from 'uuid';

const browserVisibleFactory = () => {
  if (typeof window === 'undefined') {
    return signal(false);
  }
  const visible = signal(
    document.visibilityState === 'visible',
    ...(ngDevMode ? [{ debugName: 'visible' }] : [])
  );
  document.addEventListener('visibilitychange', () =>
    visible.set(document.visibilityState === 'visible')
  );
  return visible;
};
const browserReducedMotionFactory = () => {
  if (typeof window === 'undefined') {
    return signal('yes');
  }
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = signal(
    mediaQuery.matches ? 'yes' : 'no',
    ...(ngDevMode ? [{ debugName: 'reducedMotion' }] : [])
  );
  mediaQuery.addEventListener('change', (mediaQuery) =>
    reducedMotion.set(mediaQuery.matches ? 'yes' : 'no')
  );
  return reducedMotion;
};
const browserColorSchemeFactory = () => {
  if (typeof window === 'undefined') {
    return signal('light');
  }
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const colorScheme = signal(
    mediaQuery.matches ? 'dark' : 'light',
    ...(ngDevMode ? [{ debugName: 'colorScheme' }] : [])
  );
  mediaQuery.addEventListener('change', (mediaQuery) =>
    colorScheme.set(mediaQuery.matches ? 'dark' : 'light')
  );
  return colorScheme;
};
// export const browserPrintFactory = (): Signal<boolean> => {
//   if (typeof window === 'undefined') {
//     return signal(false)
//   };
//   const print = signal(false);
//   window.addEventListener('beforeprint', () => print.set(true));
//   window.addEventListener('afterprint', () => print.set(false));
//   return print;
// };

const getParamFromRoute = (route, param) => {
  if (route.params[param] === undefined) {
    console.error(
      `@fusion/core: Param "${param}" not available on Route "${route.routeConfig?.path}"`
    );
    return undefined;
  }
  return route.params[param];
};

const timeoutOnlyIfNeeded = (timeoutValue) => {
  if (isPlatformServer(inject(PLATFORM_ID))) return (source) => source;
  if (timeoutValue === 0) return (source) => source;
  return (source) => source.pipe(timeout(timeoutValue));
};
const onoff$ = (source$, toggle$) => {
  return toggle$.pipe(
    distinctUntilChanged(),
    filter((toggle) => toggle === true),
    switchMap(() =>
      source$.pipe(
        takeUntil(
          toggle$.pipe(filter((toggle) => toggle === false))
        )
      )
    )
  );
};
const waitForSignalValue$ = (valueFn, valueMatchFn, config) => {
  const injector = config?.injector ?? inject(Injector);
  const timeout = config?.timeout ?? 1000;
  return new Observable((observer) => {
    return runInInjectionContext(injector, () => {
      const valueSignal = valueFn();
      const effectCleanup = effect(
        () => {
          const value = valueSignal();
          if (valueMatchFn(value)) {
            observer.next(value);
            observer.complete();
          }
        },
        ...(ngDevMode ? [{ debugName: 'effectCleanup' }] : [])
      );
      return () => {
        effectCleanup.destroy();
      };
    });
  }).pipe(
    timeoutOnlyIfNeeded(timeout),
    map(() => true),
    catchError(() => {
      console.error(
        `[@fusion/core/utils]: tried to wait for correct value, timeout triggered after ${timeout}ms`
      );
      return of(true);
    }),
    take(1),
    takeUntilDestroyed()
  );
};

const useTransferState = (config) => {
  const stateKey = makeStateKey(config.key);
  const tranferState = inject(TransferState);
  if (isPlatformServer(inject(PLATFORM_ID))) {
    tranferState.set(stateKey, config.serverData());
    return config.serverData();
  }
  return tranferState.get(stateKey, config.browserData());
};

type UuidV4 = () => string;

const uuidV4: UuidV4 | undefined =
  (uuidModule as { v4?: UuidV4 }).v4 ??
  (uuidModule as { default?: { v4?: UuidV4 } }).default?.v4;

const uuid = () => {
  if (uuidV4) {
    return uuidV4();
  }
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  throw new Error(
    'uuid v4 export not found. Install uuid@9+ or provide crypto.randomUUID().'
  );
};

/**
 * Generated bundle index. Do not edit.
 */

export {
  browserColorSchemeFactory,
  browserReducedMotionFactory,
  browserVisibleFactory,
  getParamFromRoute,
  onoff$,
  timeoutOnlyIfNeeded,
  useTransferState,
  uuid,
  waitForSignalValue$,
};
//# sourceMappingURL=fusion-core-utils.mjs.map
