require("dotenv").config();
// FIX: node-fetch v3 ESM import
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const GEMINI_KEY = process.env.GEMINI_API_KEY;

/* ----------------------------------------------------------
   Low level: call Gemini API
-----------------------------------------------------------*/
async function callGemini(prompt, model = "models/gemini-2.0-flash") {
  if (!GEMINI_KEY) {
    return { error: "GEMINI_API_KEY not configured" };
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${GEMINI_KEY}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

/* ----------------------------------------------------------
   HIGH LEVEL: Main backend function — generateConfig()
-----------------------------------------------------------*/
async function generateConfig(options) {
  const { languages, packages } = options;

  const prompt = `
Generate a Dockerfile, devcontainer.json, and a dependency list.
Languages: ${languages.join(", ")}
Packages: ${packages.join(", ")}

Respond ONLY in this JSON structure:

{
  "dockerfile": "...",
  "devcontainer": "...",
  "dependencies": "..."
}
`;

  const ai = await callGemini(prompt);

  if (ai.error) return { error: ai.error };

  let rawText = "";

  try {
    rawText = ai.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (e) {
    return { error: "Invalid AI response format" };
  }

  // Extract JSON content inside ```json ... ```
  const jsonMatch = rawText.match(/```json([\s\S]*?)```/);
  const cleanJson = jsonMatch ? jsonMatch[1].trim() : rawText.trim();

  try {
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (e) {
    return { error: "Failed to parse AI JSON", raw: cleanJson };
  }
}

module.exports = { callGemini, generateConfig };