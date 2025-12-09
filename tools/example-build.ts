import inquirer from 'inquirer';

interface BuildAnswers {
  environment: 'development' | 'staging' | 'production';
  shouldMinify: boolean;
  outputDir: string;
}

async function runBuild(): Promise<void> {
  const answers = await inquirer.prompt<BuildAnswers>([
    {
      type: 'list',
      name: 'environment',
      message: 'Select the target environment:',
      choices: ['development', 'staging', 'production'],
      default: 'development',
    },
    {
      type: 'confirm',
      name: 'shouldMinify',
      message: 'Should the output be minified?',
      default: (answers: Partial<BuildAnswers>) =>
        answers.environment === 'production',
    },
    {
      type: 'input',
      name: 'outputDir',
      message: 'Output directory:',
      default: 'dist',
    },
  ]);

  console.log('\n📦 Build Configuration:');
  console.log(`   Environment: ${answers.environment}`);
  console.log(`   Minify: ${answers.shouldMinify}`);
  console.log(`   Output: ${answers.outputDir}`);
  console.log('\n✅ Build script ready to execute with these settings.\n');
}

runBuild().catch(console.error);
