import { firstValueFrom, isObservable, Observable } from 'rxjs';
import { withMethods } from '@ngrx/signals';

export type FormActionStatus = 'success' | 'error';

export interface FormActionResult<TResult> {
  value?: TResult;
  error?: unknown;
  status: FormActionStatus;
}

export interface FormActionConfig<TPayload, TResult, TCtx, TStore> {
  /**
   * Perform the actual request using only the payload; ctx is excluded by design.
   * Can return an Observable, Promise, or plain value.
   */
  request: (payload: TPayload, store: TStore) => Observable<TResult> | Promise<TResult> | TResult;
  /**
   * Optional success side-effects, receives ctx for client-only logic (routing, toasts, etc.).
   */
  onSuccess?: (result: TResult, ctx: TCtx | undefined, store: TStore) => void | Promise<void>;
  /**
   * Optional error side-effects, receives ctx for client-only logic.
   */
  onError?: (error: unknown, ctx: TCtx | undefined, store: TStore) => void | Promise<void>;
}

export type ToFormActions<TStore, TDefs> = {
  [K in keyof TDefs]: TDefs[K] extends FormActionConfig<infer P, infer R, infer C, TStore>
    ? (payload: P, ctx?: C) => Promise<FormActionResult<R>>
    : never;
};

function toPromise<T>(value: Observable<T> | Promise<T> | T): Promise<T> {
  if (isObservable(value)) return firstValueFrom(value as Observable<T>);
  if (value instanceof Promise) return value;
  return Promise.resolve(value);
}

function createFormAction<TPayload, TResult, TCtx, TStore>(
  store: TStore,
  config: FormActionConfig<TPayload, TResult, TCtx, TStore>,
): (payload: TPayload, ctx?: TCtx) => Promise<FormActionResult<TResult>> {
  return async (payload: TPayload, ctx?: TCtx): Promise<FormActionResult<TResult>> {
    try {
      const result = await toPromise(config.request(payload, store));
      await config.onSuccess?.(result, ctx, store);
      return { value: result, status: 'success' };
    } catch (error) {
      await config.onError?.(error, ctx, store);
      return { error, status: 'error' };
    }
  };
}

/**
 * withSignalForm: Define ctx-aware form actions on a signal store.
 * - Each action accepts (payload, ctx?) and returns Promise<{ value | error, status }>.
 * - The HTTP request is called with payload only; ctx is available only for client-side side-effects.
 */
export function withSignalForm<TStore, TDefs extends Record<string, FormActionConfig<any, any, any, TStore>>>(
  defsFactory: (store: TStore) => TDefs,
) {
  return withMethods((store: TStore) => {
    const defs = defsFactory(store);
    const entries = Object.entries(defs) as [keyof TDefs, FormActionConfig<any, any, any, TStore>][];
    const actions = Object.fromEntries(
      entries.map(([key, def]) => [key as string, createFormAction(store, def)]),
    ) as unknown as ToFormActions<TStore, TDefs>;

    return actions;
  });
}
