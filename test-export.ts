// Test file to verify ESM exports work correctly

// Test 1: Inline export
export const testFunction1 = () => {
  return 'test1';
};

// Test 2: Export statement
const testFunction2 = () => {
  return 'test2';
};
export { testFunction2 };

// Test 3: Both (should work but might cause confusion)
export const testFunction3 = () => {
  return 'test3';
};
// export { testFunction3 }; // Uncommenting this might cause issues

// Test 4: Default export
export default {
  testFunction1,
  testFunction2,
  testFunction3,
};
