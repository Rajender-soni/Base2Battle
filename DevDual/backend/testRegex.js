const code = `class Solution {
public:
    int incremovableSubarrayCount(vector<int>& nums) {
        return 10;
    }
};`; 
const regex = /class\s+Solution\s*\{[\s\S]*?(?:public:\s*)?(?:static\s+)?([a-zA-Z0-9_<>\s*&]+)\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/; 
const match = code.match(regex); 
console.log(match ? 'MATCHED' : 'FAILED'); 
if (match) console.log(match[1], '|', match[2], '|', match[3]);
