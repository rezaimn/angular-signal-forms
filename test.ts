let jitCompilerLoadPromise: Promise<void> | undefined;

export type JitCompilerLoadMode = "whenMissing" | "always";

/**
 * Ensures @angular/compiler is loaded so JIT fallback works for partially linked
 * libraries. Call before bootstrapping if linker did not run.
 */
export async function ensureAngularJitCompilerLoaded(
  mode: JitCompilerLoadMode = "whenMissing",
): Promise<void> {
  if (mode === "whenMissing" && isAngularJitCompilerAvailable()) {
    return;
  }

  if (!jitCompilerLoadPromise) {
    jitCompilerLoadPromise = import("@angular/compiler").then(() => undefined);
  }

  await jitCompilerLoadPromise;
}

/**
 * Wraps any bootstrap function with a JIT compiler load.
 * Example:
 *   bootstrapWithJitFallback(() => platformBrowserDynamic().bootstrapModule(AppModule))
 */
export async function bootstrapWithJitFallback<T>(
  bootstrap: () => Promise<T>,
): Promise<T> {
  await ensureAngularJitCompilerLoaded();
  return bootstrap();
}

function isAngularJitCompilerAvailable(): boolean {
  const globalNg = (globalThis as {
    ng?: {
      compiler?: unknown;
      JitCompilerFactory?: unknown;
      ɵcompiler?: unknown;
    };
  }).ng;

  return Boolean(
    globalNg?.compiler || globalNg?.JitCompilerFactory || globalNg?.ɵcompiler,
  );
}