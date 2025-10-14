import { defer, from, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import type { FlatteningOperator } from './flattening-operator';
import { concatOp } from './flattening-operator';

export interface CoreMutationOptions<Input, Output, Ctx = unknown, ErrorType = unknown> {
  // Given Input, produce an Output (Observable or Promise). Must be pure w.r.t. Input.
  request: (input: Input) => Observable<Output> | Promise<Output>;

  // How concurrent requests are flattened (concat by default)
  operator?: FlatteningOperator;

  // Optional lifecycle hooks. These are called with the original input and caller-provided ctx
  onSuccess?: (output: Output, input: Input, ctx?: Ctx) => void;
  onError?: (error: ErrorType, input: Input, ctx?: Ctx) => void;
  onFinalize?: (input: Input, ctx?: Ctx) => void;
}

export interface Mutation<Input, Output, Ctx = unknown> {
  // Triggers the mutation for the given input and optional context
  trigger: (input: Input, ctx?: Ctx) => void;

  // Expose a readonly stream of raw outputs if needed by callers
  output$: Observable<Output>;

  // Expose a readonly stream of errors
  error$: Observable<unknown>;
}

function toObservable<T>(value: Observable<T> | Promise<T>): Observable<T> {
  return value instanceof Observable ? value : from(value);
}

/**
 * Core mutation constructor. This is the only primitive. Higher-level helpers (e.g. httpMutation)
 * are thin wrappers built on top of it. Crucially, the type parameters are (Input, Output, Ctx),
 * making all downstream helpers conform to these core shapes rather than the other way around.
 */
export function createMutation<Input, Output, Ctx = unknown, ErrorType = unknown>(
  options: CoreMutationOptions<Input, Output, Ctx, ErrorType>,
): Mutation<Input, Output, Ctx> {
  const call$ = new Subject<{ input: Input; ctx?: Ctx }>();
  const outputSubject = new Subject<Output>();
  const errorSubject = new Subject<unknown>();

  // Build higher-order observable where each call maps to a deferred request observable
  const higherOrder$ = call$.pipe(
    map(({ input, ctx }) =>
      defer(() =>
        toObservable(options.request(input)).pipe(
          tap({
            next: (output) => {
              options.onSuccess?.(output, input, ctx);
              outputSubject.next(output);
            },
            error: (err) => {
              options.onError?.(err as ErrorType, input, ctx);
              errorSubject.next(err);
            },
          }),
          catchError((err) => {
            // Swallow the error here to keep the flattening operator alive; downstream error$ already received it
            return of(undefined as unknown as Output);
          }),
          finalize(() => options.onFinalize?.(input, ctx)),
        ),
      ),
    ),
  );

  // Default to concat flattening to preserve call order unless otherwise specified
  const flatten = options.operator ?? concatOp;
  const subscription = flatten(higherOrder$).subscribe();

  // Consumers can ignore subscription management; this will live for app lifetime typically.
  // If needed, we could expose a destroy() method to unsubscribe.

  return {
    trigger(input: Input, ctx?: Ctx) {
      call$.next({ input, ctx });
    },
    output$: outputSubject.asObservable(),
    error$: errorSubject.asObservable(),
  };
}
