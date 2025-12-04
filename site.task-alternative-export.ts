// Alternative export pattern that definitely works with ESM

// Option 1: Export everything at the bottom (most reliable for ESM)
// Remove inline exports, define everything as const, then export all at once

const handleBarConfigForIndexHtml = (environment: Environment, IS_MOBILE: unknown, IS_FUSION: boolean) => {
  // ... your implementation
};

const buildSite = gulp.series(
  // ... your implementation
);

const handleBarSettings = {
  // ... your implementation
};

const minifyFileGulpTask = (src, dest, env = environment) => {
  // ... your implementation
};

// Single export statement at the end
export {
  handleBarConfigForIndexHtml,
  buildSite,
  handleBarSettings,
  minifyFileGulpTask,
};

// Option 2: If Option 1 doesn't work, try this pattern:
// export * as siteTask from './site.task.js' won't work, but you can do:

export default {
  handleBarConfigForIndexHtml,
  buildSite,
  handleBarSettings,
  minifyFileGulpTask,
};

// Then import as:
// import siteTask from '../../tasks/site.task.js';
// const { handleBarConfigForIndexHtml } = siteTask;
