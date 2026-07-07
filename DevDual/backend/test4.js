import mongoose from 'mongoose';
import { runDocker } from './services/executionService.js';
import Problem from './model/problemModel.js';

mongoose.connect('mongodb://bhandarijee5672_db_user:bhandari9811@ac-ujhskqx-shard-00-00.vxbppjy.mongodb.net:27017,ac-ujhskqx-shard-00-01.vxbppjy.mongodb.net:27017,ac-ujhskqx-shard-00-02.vxbppjy.mongodb.net:27017/?ssl=true&replicaSet=atlas-10ajom-shard-0&authSource=admin&appName=leet-compete-cluster').then(async () => {
    const p = await Problem.findById('690fbc0a8379911f2482e009');
    
    let targetFuncName = null;
    const snippet = p.codeSnippets.find(s => s.langSlug === 'cpp');
    const match = snippet.code.match(/class\s+Solution\s*\{[\s\S]*?(?:public:\s*)?(?:static\s+)?([a-zA-Z0-9_<>\s*&]+)\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/);
    if (match) targetFuncName = match[2].trim();
    
    const code = `class Solution {
public:
    bool check(vector<int>& v) { return false; }
    int incremovableSubarrayCount(vector<int>& nums) {
        return 10;
    }
};`;

    console.log("Target Func Name:", targetFuncName);

    const result = await runDocker(code, '[1, 2, 3]', 'cpp', null, targetFuncName);
    console.log("Result:", result);
    process.exit(0);
});
