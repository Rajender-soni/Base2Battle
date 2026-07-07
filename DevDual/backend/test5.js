import { runDocker } from './services/executionService.js';

const code = `#include <stack>
class Solution {
public:
    int minLength(string s) {
        stack<char> st;
        for (char ch : s) {
            if (!st.empty() &&
                ((st.top() == 'A' && ch == 'B') ||
                 (st.top() == 'C' && ch == 'D'))) {
                st.pop();
            } else {
                st.push(ch);
            }
        }
        return st.size();
    }
};`;

const input = '{"s": "ABFCACDB"}';

const result = await runDocker(code, input, 'cpp', null, 'minLength');
console.log('Result:', result);
