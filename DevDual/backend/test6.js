import { runDocker } from './services/executionService.js';

const code = `class Solution {
public:
    int sum(int num1, int num2) {
        return num1 + num2;
    }
};`;

// Test with an object input (as stored in MongoDB)
const objectInput = { num1: 12, num2: 5 };
const stringInput = '{"num1": 12, "num2": 5}';

console.log("Testing with object input:", objectInput);
const r1 = await runDocker(code, objectInput, 'cpp', null, 'sum');
console.log("Result (object):", r1.run.stdout, r1.run.stderr);

console.log("\nTesting with string JSON input:", stringInput);
const r2 = await runDocker(code, stringInput, 'cpp', null, 'sum');
console.log("Result (string):", r2.run.stdout, r2.run.stderr);
