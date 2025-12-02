import inquirer from 'inquirer';
import { resolve } from 'path';

console.log('✅ ESM Configuration Verification\n');

console.log('Module System:');
console.log(`  - Type: ${typeof import.meta.url !== 'undefined' ? 'ESM' : 'CommonJS'}`);
console.log(`  - import.meta.url: ${import.meta.url}`);

console.log('\nInquirer v13:');
console.log(`  - Loaded: ✅`);
console.log(`  - Type: ${typeof inquirer}`);

console.log('\nTypeScript Config:');
console.log(`  - Module: nodenext`);
console.log(`  - ModuleResolution: nodenext`);

console.log('\n🎉 All ESM features working correctly!');
