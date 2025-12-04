# Fix: Remove Duplicate Exports

If `handleBarConfigForIndexHtml` is already exported inline with `export const`, you MUST remove it from the bottom export statement.

## Wrong (causes the error):
```ts
export const handleBarConfigForIndexHtml = (...) => { ... };

// ... rest of file ...

export { buildSite, handleBarSettings, minifyFileGulpTask, handleBarConfigForIndexHtml };
//                                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ REMOVE THIS
```

## Correct:
```ts
export const handleBarConfigForIndexHtml = (...) => { ... };
export const buildSite = gulp.series(...);

// ... rest of file ...

// Only export things that aren't already exported inline
export { handleBarSettings, minifyFileGulpTask };
```

## The Fix:

In `tools/build/tasks/site.task.ts`, change the bottom export from:

```ts
export { buildSite, handleBarSettings, minifyFileGulpTask, handleBarConfigForIndexHtml };
```

To:

```ts
export { handleBarSettings, minifyFileGulpTask };
```

And make sure `buildSite` is also exported inline:
```ts
export const buildSite = gulp.series(...);
```
