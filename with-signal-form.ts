/*
  with-signal-form.ts

  A tiny store feature that lets you define form actions which:
  - accept a payload and an optional ctx
  - execute an async request based on the payload only (ctx is NOT sent)
  - return a Promise<{ status, value, error }>

  Designed to be framework-agnostic and easy to wire into an @ngrx/signals
  signalStore via a feature mixin.
*/

// Status reported when the Promise resolves
export type FormActionStatus = 'success' | 'error';

export interface FormActionResult<TValue, TError = unknown> {
  status: FormActionStatus;
  value?: TValue;
  error?: TError;
}

// Minimal Observable-like structural type to avoid hard dependency on rxjs in this file
export interface ObservableLike<T> {
  subscribe(observer: {
    next?: (value: T) => void;
    error?: (err: unknown) => void;
    complete?: () => void;
  }): { unsubscribe?: () => void };
}

export type RequestFn<TPayload, TValue> = (
  payload: TPayload
) => Promise<TValue> | ObservableLike<TValue> | TValue;

export interface FormActionOptions<TPayload, TValue, TError = unknown, TCtx = unknown> {
  // Called to perform the actual remote/local work. Receives ONLY the payload.
  request: RequestFn<TPayload, TValue>;

  // Optional side effects
  onSuccess?: (value: TValue, ctx?: TCtx, payload?: TPayload) => void;
  onError?: (error: TError, ctx?: TCtx, payload?: TPayload) => void;
  onFinally?: (ctx?: TCtx, payload?: TPayload) => void;
}

export type FormActionFn<TPayload, TValue, TError = unknown, TCtx = unknown> = (
  payload: TPayload,
  ctx?: TCtx
) => Promise<FormActionResult<TValue, TError>>;

// Convert Promise | ObservableLike | value into a Promise
function toPromise<T>(input: Promise<T> | ObservableLike<T> | T): Promise<T> {
  // If already a Promise
  if (typeof (input as any)?.then === 'function') {
    return input as Promise<T>;
  }

  // If it looks like an Observable
  if (typeof (input as any)?.subscribe === 'function') {
    return new Promise<T>((resolve, reject) => {
      let lastValue: T | undefined;
      const sub = (input as ObservableLike<T>).subscribe({
        next: (v) => {
          lastValue = v;
        },
        error: (e) => {
          try {
            sub?.unsubscribe?.();
          } catch {}
          reject(e);
        },
        complete: () => {
          try {
            sub?.unsubscribe?.();
          } catch {}
          // HTTP-like streams emit once; for multi-emit, resolve last value
          resolve(lastValue as T);
        },
      });
    });
  }

  // Plain value
  return Promise.resolve(input as T);
}

export function formAction<TPayload, TValue, TError = unknown, TCtx = unknown>(
  options: FormActionOptions<TPayload, TValue, TError, TCtx>
): FormActionFn<TPayload, TValue, TError, TCtx> {
  const { request, onSuccess, onError, onFinally } = options;

  return async (payload: TPayload, ctx?: TCtx): Promise<FormActionResult<TValue, TError>> => {
    try {
      const result = await toPromise<TValue>(request(payload));
      onSuccess?.(result, ctx, payload);
      return { status: 'success', value: result };
    } catch (err) {
      const typed = err as TError;
      onError?.(typed, ctx, payload);
      return { status: 'error', error: typed };
    } finally {
      onFinally?.(ctx, payload);
    }
  };
}

// Simple feature-mixin adapter so this can slot into an @ngrx/signals signalStore
// usage like: signalStore( ..., withSignalForm((store, { formAction }) => ({ ... })) )
export type StoreFeature<TStore, TExt> = (store: TStore) => TStore & TExt;

export function withSignalForm<TStore, TExt extends Record<string, unknown>>(
  factory: (store: TStore, api: { formAction: typeof formAction }) => TExt
): StoreFeature<TStore, TExt> {
  return (store: TStore) => {
    const ext = factory(store, { formAction });
    return Object.assign(store as object, ext) as TStore & TExt;
  };
}
