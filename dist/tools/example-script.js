import inquirer from 'inquirer';
const answers = await inquirer.prompt([
    {
        type: 'input',
        name: 'name',
        message: 'What is your name?',
    },
    {
        type: 'confirm',
        name: 'proceed',
        message: 'Do you want to proceed?',
        default: true,
    },
]);
console.log('Answers:', answers);
//# sourceMappingURL=example-script.js.map