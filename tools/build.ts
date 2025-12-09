import inquirer from 'inquirer';

async function main() {
  console.log('🚀 Build Script Example with Inquirer v13 (ESM)\n');

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'buildType',
      message: 'What type of build do you want to run?',
      choices: ['production', 'development', 'staging'],
    },
    {
      type: 'confirm',
      name: 'optimize',
      message: 'Enable optimizations?',
      default: true,
    },
  ]);

  console.log('\n✅ Build configuration:');
  console.log(`   Build type: ${answers.buildType}`);
  console.log(`   Optimizations: ${answers.optimize ? 'enabled' : 'disabled'}`);

  // Your build logic here
  console.log('\n🔨 Running build...');
  console.log('✨ Build complete!');
}

main().catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
