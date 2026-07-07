import { runDocker } from './services/executionService.js';
const code = `class Solution {
public:
    int incremovableSubarrayCount(vector<int>& nums) {
        return 10;
    }
};`;
const input = '[1, 2, 3]';
runDocker(code, input, 'cpp').then(console.log).catch(console.error);
