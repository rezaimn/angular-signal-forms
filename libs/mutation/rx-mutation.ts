import { createMutation, type CoreMutationOptions, type Mutation } from './mutation';
import type { FlatteningOperator } from './flattening-operator';
import { concatOp } from './flattening-operator';
import { defer, Observable, of } from 'rxjs';

export interface RxMutationOptions<Input, Output, Ctx = unknown, ErrorType = unknown> {
  // Build the request observable for a given input
  request: (input: Input) => Observable<Output>;
  operator?: FlatteningOperator;
  onSuccess?: CoreMutationOptions<Input, Output, Ctx, ErrorType>['onSuccess'];
  onError?: CoreMutationOptions<Input, Output, Ctx, ErrorType>['onError'];
  onFinalize?: CoreMutationOptions<Input, Output, Ctx, ErrorType>['onFinalize'];
}

export function rxMutation<Input, Output, Ctx = unknown, ErrorType = unknown>(
  options: RxMutationOptions<Input, Output, Ctx, ErrorType>,
): Mutation<Input, Output, Ctx> {
  const operator = options.operator ?? concatOp;

  return createMutation<Input, Output, Ctx, ErrorType>({
    request: (input) => defer(() => options.request(input)),
    operator,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onFinalize: options.onFinalize,
  });
}
