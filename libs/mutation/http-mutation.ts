import { createMutation, type CoreMutationOptions, type Mutation } from './mutation';
import type { FlatteningOperator } from './flattening-operator';
import { concatOp } from './flattening-operator';

export interface HttpRequestConfig {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
}

export interface HttpMutationOptions<Input, Output, Ctx = unknown, ErrorType = unknown> {
  // Build an HTTP request config from the input. No ctx is involved here by design.
  request: (input: Input) => Promise<HttpRequestConfig> | HttpRequestConfig;

  // How to flatten concurrent requests
  operator?: FlatteningOperator;

  // Fetch implementation; defaults to global fetch
  fetchImpl?: typeof fetch;

  // Transform a successful response into Output
  transformResponse?: (response: Response) => Promise<Output>;

  // Decide which HTTP statuses are considered success
  validateStatus?: (status: number) => boolean;

  // Optional lifecycle hooks aligned with core mutation
  onSuccess?: CoreMutationOptions<Input, Output, Ctx, ErrorType>['onSuccess'];
  onError?: CoreMutationOptions<Input, Output, Ctx, ErrorType>['onError'];
  onFinalize?: CoreMutationOptions<Input, Output, Ctx, ErrorType>['onFinalize'];
}

const defaultValidate = (s: number) => s >= 200 && s < 300;

export function httpMutation<Input, Output, Ctx = unknown, ErrorType = unknown>(
  options: HttpMutationOptions<Input, Output, Ctx, ErrorType>,
): Mutation<Input, Output, Ctx> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const operator = options.operator ?? concatOp;

  return createMutation<Input, Output, Ctx, ErrorType>({
    request: async (input: Input) => {
      const cfg = await options.request(input);

      const maybeStringBody =
        typeof cfg.body === 'string' || cfg.body == null ? (cfg.body as string | undefined) : JSON.stringify(cfg.body);

      const response = await fetchImpl(cfg.url, {
        method: cfg.method ?? 'GET',
        headers: cfg.headers,
        body: maybeStringBody,
        credentials: cfg.credentials,
      });

      const ok = (options.validateStatus ?? defaultValidate)(response.status);
      if (!ok) {
        // Try to parse JSON error; fall back to text; ultimately throw Response if nothing else
        let errorPayload: unknown = undefined;
        try {
          errorPayload = await response.clone().json();
        } catch {
          try {
            errorPayload = await response.clone().text();
          } catch {
            errorPayload = { status: response.status, statusText: response.statusText };
          }
        }
        // Re-throw a structured error
        throw { status: response.status, statusText: response.statusText, payload: errorPayload } as unknown as ErrorType;
      }

      if (options.transformResponse) {
        return options.transformResponse(response);
      }

      // Default JSON decode
      return (await response.json()) as Output;
    },
    operator,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onFinalize: options.onFinalize,
  });
}
