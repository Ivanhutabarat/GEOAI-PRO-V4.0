export const processIncomingData = (promptText: string) => {
  // 1. BRUTE FORCE FINDER: Find the first '[' and last ']'
  const startIndex = promptText.indexOf('[');
  const endIndex = promptText.lastIndexOf(']');
  
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    console.error("Parser Error: JSON bounds not found.");
    return null;
  }
  
  const jsonString = promptText.substring(startIndex, endIndex + 1);
  console.log("Extracted String:", jsonString);
  
  // 2. PARSE THE CLEANED STRING
  let data: any[] = [];
  try {
    data = JSON.parse(jsonString);
    if (!Array.isArray(data)) data = [data];
  } catch (e) {
    console.error("JSON Brute Parse Error:", e);
    return null;
  }
  
  // 3. UNIVERSAL KEY IDENTIFICATION
  if (!data || data.length === 0) return null;
  const keys = Object.keys(data[0]);
  const keysStr = keys.join("_").toLowerCase();
  
  console.log("Data Detected:", data.length, "rows");
  
  return { data, keys, keysStr };
};
