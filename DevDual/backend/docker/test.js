import { runDocker } from "../services/executionService.js";

async function test() {
    console.log("===== C++ Test =====");

    const cppResult = await runDocker(
        `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;

    cout << a + b;

    return 0;
}`,
        "5 7",
        "cpp"
    );

    console.log(cppResult);

    console.log("\n===== Python Test =====");

    const pythonResult = await runDocker(
        `a, b = map(int, input().split())
print(a + b)`,
        "10 15",
        "python"
    );

    console.log(pythonResult);

    console.log("\n===== JavaScript Test =====");

    const jsResult = await runDocker(
        `const fs = require("fs");

const input = fs
    .readFileSync(0, "utf8")
    .trim()
    .split(" ")
    .map(Number);

console.log(input[0] + input[1]);`,
        "20 30",
        "javascript"
    );

    console.log(jsResult);

    console.log("\n===== Runtime Error Test =====");

    const runtimeResult = await runDocker(
        `#include <iostream>
using namespace std;

int main() {
    int x = 0;

    cout << 10 / x;

    return 0;
}`,
        "",
        "cpp"
    );

    console.log(runtimeResult);

    console.log("\n===== Compilation Error Test =====");

    const compileResult = await runDocker(
        `#include <iostream>
using namespace std

int main() {
    cout << "Hello";
}`,
        "",
        "cpp"
    );

    console.log(compileResult);

    console.log("\n===== Infinite Loop Test =====");

    const tleResult = await runDocker(
        `while True:
    pass`,
        "",
        "python"
    );

    console.log(tleResult);
}

test().catch(console.error);