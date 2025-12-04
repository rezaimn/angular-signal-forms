#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import inquirer from 'inquirer';
import { runPreScripts } from './pre-scripts.js';
import { buildProject } from './builder.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface BuildConfig {
  site: string;
  channel: string;
  environment: string;
  mode: 'serve' | 'build';
}

async function parseArguments(): Promise<BuildConfig> {
  const { values } = parseArgs({
    options: {
      site: { type: 'string', default: 'aduk' },
      channel: { type: 'string', default: 'web' },
      environment: { type: 'string', default: 'local' },
      mode: { type: 'string', default: 'serve' },
    },
    strict: false,
  });

  return {
    site: values.site as string,
    channel: values.channel as string,
    environment: values.environment as string,
    mode: values.mode as 'serve' | 'build',
  };
}

async function promptForMissingConfig(config: BuildConfig): Promise<BuildConfig> {
  const questions = [];

  if (!config.site) {
    questions.push({
      type: 'list',
      name: 'site',
      message: 'Select site:',
      choices: ['aduk', 'site2', 'site3'],
    });
  }

  if (questions.length > 0) {
    const answers = await inquirer.prompt(questions);
    return { ...config, ...answers };
  }

  return config;
}

async function main() {
  console.log('Seasn Mohammadreza 😺\n');

  let config = await parseArguments();
  config = await promptForMissingConfig(config);

  console.log('Configuration');
  console.log(`Site         ${config.site}`);
  console.log(`Channel      ${config.channel}`);
  console.log(`Environment  ${config.environment}`);
  console.log(`Mode         ${config.mode}\n`);

  console.log('Pre Scripts');
  await runPreScripts(config);

  console.log('\nBuilding...');
  await buildProject(config);
}

main().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
