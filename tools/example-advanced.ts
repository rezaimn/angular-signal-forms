import inquirer from 'inquirer';
import { readdir } from 'fs/promises';
import { join } from 'path';

/**
 * Advanced example showcasing Inquirer v13 with ESM
 * Demonstrates multiple prompt types and async operations
 */

async function getProjectFiles(): Promise<string[]> {
  try {
    const files = await readdir(process.cwd());
    return files.filter(f => !f.startsWith('.') && f !== 'node_modules');
  } catch {
    return [];
  }
}

async function runAdvancedBuild() {
  console.log('🔧 Advanced Build Configuration\n');

  // Dynamic choices from async operation
  const projectFiles = await getProjectFiles();

  const config = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'my-project',
      validate: (input: string) => {
        if (input.length < 3) return 'Name must be at least 3 characters';
        return true;
      },
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features to enable:',
      choices: [
        { name: 'TypeScript', value: 'typescript', checked: true },
        { name: 'ESLint', value: 'eslint', checked: true },
        { name: 'Prettier', value: 'prettier', checked: true },
        { name: 'Testing (Jest)', value: 'jest' },
        { name: 'Docker', value: 'docker' },
      ],
    },
    {
      type: 'list',
      name: 'environment',
      message: 'Target environment:',
      choices: ['development', 'staging', 'production'],
      default: 'development',
    },
    {
      type: 'confirm',
      name: 'generateDocs',
      message: 'Generate documentation?',
      default: false,
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'API Key (optional):',
      mask: '*',
      when: (answers) => answers.environment === 'production',
    },
  ]);

  // Display configuration
  console.log('\n📋 Configuration Summary:');
  console.log(`  Project: ${config.projectName}`);
  console.log(`  Environment: ${config.environment}`);
  console.log(`  Features: ${config.features.join(', ')}`);
  console.log(`  Generate docs: ${config.generateDocs ? 'yes' : 'no'}`);
  if (config.apiKey) {
    console.log(`  API Key: ${'*'.repeat(config.apiKey.length)}`);
  }

  console.log(`\n📁 Project files: ${projectFiles.length} files detected`);
  
  return config;
}

// Top-level await works in ESM!
try {
  const result = await runAdvancedBuild();
  console.log('\n✅ Build configuration complete!');
  process.exit(0);
} catch (error) {
  if (error instanceof Error && error.message.includes('User force closed')) {
    console.log('\n⚠️  Build cancelled by user');
    process.exit(0);
  }
  console.error('\n❌ Error:', error);
  process.exit(1);
}
