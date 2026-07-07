// In your component where you display results:

const displayResults = (data) => {
  let responseText = "";

  if (data.status === "Accepted") {
    responseText = `✅ ${data.status}\n\n`;
    responseText += `Test Cases Passed: ${data.testCasesPassed}/${data.totalTestCases}\n\n`;
    
    if (data.testResults) {
      responseText += "Test Results:\n";
      data.testResults.forEach((test) => {
        responseText += `\nTest ${test.testCase}:\n`;
        responseText += `  Input: ${test.input}\n`;
        responseText += `  Expected: ${test.expectedOutput}\n`;
        responseText += `  Got: ${test.actualOutput}\n`;
        responseText += `  ✓ Passed\n`;
      });
    }
  } else if (data.status === "Wrong Answer") {
    responseText = `❌ ${data.status}\n\n`;
    responseText += `Failed on test case ${data.testCaseFailed}/${data.totalTestCases}\n\n`;
    
    if (data.testResults) {
      responseText += "Test Results:\n";
      data.testResults.forEach((test) => {
        responseText += `\nTest ${test.testCase}:\n`;
        responseText += `  Input: ${test.input}\n`;
        responseText += `  Expected: ${test.expectedOutput}\n`;
        responseText += `  Your Output: ${test.actualOutput}\n`;
        responseText += `  ${test.passed ? '✓' : '✗'} ${test.passed ? 'Passed' : 'Failed'}\n`;
        if (test.explanation) {
          responseText += `  Issue: ${test.explanation}\n`;
        }
      });
    }
    
    if (data.needsCorrection && data.correctedCode) {
      responseText += `\n${'─'.repeat(50)}\n`;
      responseText += `📝 CORRECTED CODE:\n\n${data.correctedCode}\n\n`;
      responseText += `💡 Explanation: ${data.correctionExplanation}\n`;
    }
  } else if (data.status === "Error") {
    responseText = `💥 ${data.status}\n\n`;
    responseText += `Error: ${data.error}\n\n`;
    
    if (data.needsCorrection && data.correctedCode) {
      responseText += `${'─'.repeat(50)}\n`;
      responseText += `📝 CORRECTED CODE:\n\n${data.correctedCode}\n\n`;
      responseText += `💡 ${data.correctionExplanation}\n`;
    }
  }

  return responseText;
};