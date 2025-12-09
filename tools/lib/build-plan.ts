export type BuildTarget = keyof typeof TARGETS;

export type BuildOptions = {
  dryRun: boolean;
  watch: boolean;
};

export type BuildPlan = {
  target: BuildTarget;
  description: string;
  steps: string[];
  dryRun: boolean;
  watch: boolean;
};

export type BuildTargetChoice = {
  value: BuildTarget;
  name: string;
  short: string;
  description: string;
};

const TARGETS = {
  core: {
    description: 'Compile the signal-based reactive forms core package',
    steps: [
      'Perform type-checking against the latest TypeScript configuration',
      'Bundle the core package outputs for ESM and CJS consumers',
      'Emit type definitions alongside the compiled artifacts'
    ]
  },
  docs: {
    description: 'Build the documentation site with embedded live examples',
    steps: [
      'Lint the Markdown/MDX sources for the docs',
      'Transpile shared demo components used across the docs',
      'Export a static site into the docs/dist directory'
    ]
  },
  sandbox: {
    description: 'Spin up the local sandbox playground for rapid experimentation',
    steps: [
      'Seed the sandbox workspace with representative feature modules',
      'Start the Vite dev server with strict type-checking enabled',
      'Verify hot-module replacement is responding before exposing the port'
    ]
  }
} as const;

export const listBuildTargets = (): BuildTargetChoice[] =>
  (Object.entries(TARGETS) as [BuildTarget, (typeof TARGETS)[BuildTarget]][]).map(
    ([value, meta]) => ({
      value,
      short: value,
      name: `${value} · ${meta.description}`,
      description: meta.description
    })
  );

export const createBuildPlan = (target: BuildTarget, options: BuildOptions): BuildPlan => {
  const meta = TARGETS[target];

  if (!meta) {
    throw new Error(`Unknown build target: ${target}`);
  }

  const derivedSteps: string[] = [...meta.steps];
  if (options.watch) {
    derivedSteps.push('Initialize incremental watcher with rebuild triggers');
  } else {
    derivedSteps.push('Run a one-off integrity smoke test after the build');
  }

  return {
    target,
    description: meta.description,
    steps: derivedSteps,
    dryRun: options.dryRun,
    watch: options.watch
  };
};
