// Test importing from test-export.ts

// This should work with ESM
import { testFunction1, testFunction2, testFunction3 } from './test-export.js';
import testDefault from './test-export.js';

console.log('testFunction1:', testFunction1());
console.log('testFunction2:', testFunction2());
console.log('testFunction3:', testFunction3());
console.log('default:', testDefault);
