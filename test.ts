/**
 * Utilities for ensuring the Angular JIT compiler is available when
 * consuming partially-compiled libraries that were not processed by
 * the Angular Linker.
 */

let jitCompilerLoadPromise: Promise<void> | null = null;

/**
 * Load @angular/compiler once to enable JIT fallback.
 */
export async function ensureJitCompilerLoaded(): Promise<void> {
  if (!jitCompilerLoadPromise) {
    jitCompilerLoadPromise = import('@angular/compiler').then(() => undefined);
  }

  await jitCompilerLoadPromise;
}

/**
 * Attempt a bootstrap, and if it fails due to a missing JIT compiler,
 * load @angular/compiler and retry once.
 */
export async function bootstrapWithJitFallback<T>(
  bootstrap: () => Promise<T>
): Promise<T> {
  try {
    return await bootstrap();
  } catch (error) {
    if (!isJitCompilerMissingError(error)) {
      throw error;
    }

    await ensureJitCompilerLoaded();
    return bootstrap();
  }
}

function isJitCompilerMissingError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const message = String((error as { message?: unknown }).message ?? '');
  return (
    message.includes('JIT compiler') ||
    message.includes('@angular/compiler') ||
    message.includes('partially compiled') ||
    message.includes('Angular Linker')
  );
}