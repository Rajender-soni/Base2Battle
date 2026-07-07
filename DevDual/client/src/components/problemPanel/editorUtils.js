// src/components/problemPanel/editorUtils.js

export const renderValue = (val) =>
  typeof val === "object" ? JSON.stringify(val, null, 2) : String(val);

// Improved output comparison that handles arrays, numbers, and whitespace intelligently
export const formatOutput = (val) => {
  const strVal = String(val).trim();

  // Try to parse as JSON first (arrays, objects)
  try {
    const parsed = JSON.parse(strVal);
    return JSON.stringify(parsed); // Normalized JSON string
  } catch (e) {
    // Not JSON, continue
  }

  // Handle numeric strings
  const numVal = parseFloat(strVal);
  if (!isNaN(numVal) && strVal !== "") {
    return String(numVal);
  }

  // For strings, normalize whitespace but preserve structure
  return strVal.replace(/\s+/g, " ");
};

// Alternative comparison function that's more lenient
export const compareOutputs = (actual, expected) => {
  const actualFormatted = formatOutput(actual);
  const expectedFormatted = formatOutput(expected);
  return actualFormatted === expectedFormatted;
};

export async function runCode(SERVER_URL, problemId, code, language) {
  const res = await fetch(`${SERVER_URL}/evaluate/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemId, code, language }),
    credentials: 'include', // Include cookies in the request
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Run failed");
  return data;
}

export async function submitCode(SERVER_URL, problemId, code, language) {
  const res = await fetch(`${SERVER_URL}/evaluate/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemId, code, language }),
    credentials: 'include', // Include cookies in the request
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Submit failed");
  return data;
}
