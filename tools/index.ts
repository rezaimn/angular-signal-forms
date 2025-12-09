import inquirer, { type DistinctQuestion } from 'inquirer';
import {
  createBuildPlan,
  listBuildTargets,
  type BuildPlan,
  type BuildTarget
} from './lib/build-plan.js';

type PromptAnswers = {
  target: BuildTarget;
  watch: boolean;
  dryRun: boolean;
};

const questions: DistinctQuestion<PromptAnswers>[] = [
  {
    type: 'select',
    name: 'target',
    loop: false,
    message: 'Which build target do you want to run?',
    choices: listBuildTargets().map((choice) => ({
      value: choice.value,
      short: choice.short,
      name: choice.name
    })),
    default: 'core'
  },
  {
    type: 'confirm',
    name: 'watch',
    message: 'Enable watch mode?',
    default: false
  },
  {
    type: 'confirm',
    name: 'dryRun',
    message: 'Dry run only (generate plan but skip execution)?',
    default: true
  }
];

const renderPlan = (plan: BuildPlan) => {
  console.log(`\nBuild plan for "${plan.target}" (${plan.description})`);
  console.log(plan.dryRun ? 'Dry run: no commands will be executed.' : 'Commands will run immediately.');
  if (plan.watch) {
    console.log('Watch mode is ON — incremental builds will be scheduled.');
  }

  plan.steps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
  });
};

const simulateExecution = (plan: BuildPlan) => {
  if (plan.dryRun) {
    console.log('\nNothing to execute. Use --no-dry-run to perform the build.');
    return;
  }

  console.log('\nExecuting build steps...');
  plan.steps.forEach((step) => {
    console.log(`✔ ${step}`);
  });
  console.log('\nBuild finished successfully.');
};

const run = async () => {
  const answers = await inquirer.prompt<PromptAnswers>(questions);
  const plan = createBuildPlan(answers.target, {
    dryRun: answers.dryRun,
    watch: answers.watch
  });

  renderPlan(plan);
  simulateExecution(plan);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
