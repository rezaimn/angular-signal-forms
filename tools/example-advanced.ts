import inquirer from 'inquirer';

async function main() {
  console.log('🎯 Advanced Inquirer v13 Example\n');

  // Example 1: Multiple choice with checkbox
  const { features } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features to include:',
      choices: [
        { name: 'TypeScript', value: 'ts', checked: true },
        { name: 'ESLint', value: 'eslint', checked: true },
        { name: 'Prettier', value: 'prettier', checked: true },
        { name: 'Jest', value: 'jest' },
        { name: 'Vitest', value: 'vitest' },
      ],
    },
  ]);

  console.log('\n📦 Selected features:', features);

  // Example 2: Input with validation
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter project name:',
      default: 'my-awesome-project',
      validate: (input: string) => {
        if (input.length < 3) {
          return 'Project name must be at least 3 characters';
        }
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Project name must contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    },
  ]);

  console.log('✅ Project name:', projectName);

  // Example 3: Password input
  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Enter API key:',
      mask: '*',
    },
  ]);

  console.log('🔑 API key received (hidden)');

  // Example 4: Expand prompt
  const { conflict } = await inquirer.prompt([
    {
      type: 'expand',
      name: 'conflict',
      message: 'File already exists. Overwrite?',
      default: 2,
      choices: [
        { key: 'y', name: 'Overwrite', value: 'overwrite' },
        { key: 'a', name: 'Overwrite all', value: 'overwrite_all' },
        { key: 'd', name: 'Show diff', value: 'diff' },
        { key: 'x', name: 'Abort', value: 'abort' },
      ],
    },
  ]);

  console.log('📝 Conflict resolution:', conflict);

  // Example 5: Editor prompt
  const { description } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'description',
      message: 'Enter project description:',
      default: 'A modern TypeScript project with ESM support',
    },
  ]);

  console.log('\n📄 Description:', description);

  // Example 6: Number input
  const { port } = await inquirer.prompt([
    {
      type: 'number',
      name: 'port',
      message: 'Enter port number:',
      default: 3000,
      validate: (input: number) => {
        if (input < 1 || input > 65535) {
          return 'Port must be between 1 and 65535';
        }
        return true;
      },
    },
  ]);

  console.log('🌐 Port:', port);

  console.log('\n✨ All done! Inquirer v13 is working perfectly with ESM.');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
