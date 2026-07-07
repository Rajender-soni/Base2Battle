import { runDocker } from './services/executionService.js';
const code = `class Solution {
public:
    int incremovableSubarrayCount(vector<int>& nums) {
        return 10;
    }
};`;
runDocker(code, '[1, 2]', 'cpp').then(console.log).catch(console.error);
