// Simple script to verify ESM is working correctly

console.log('✅ ESM is working!');
console.log('📦 Module system:', import.meta.url);

// Top-level await works in ESM
await new Promise((resolve) => setTimeout(resolve, 100));

console.log('⏱️  Top-level await works!');
console.log('🎉 Your TypeScript + ESM setup is ready!');
