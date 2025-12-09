// backend/aiGenerator.js
require("dotenv").config();

// FIX: node-fetch v3 ESM import
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

/* ----------------------------------------------------------
   Low level: call Groq API
-----------------------------------------------------------*/
async function callGroq(prompt, model = DEFAULT_MODEL) {
    if (!GROQ_KEY) {
        return { error: "GROQ_API_KEY not configured" };
    }

    const body = {
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that generates development environment configurations. Always respond with valid, standard JSON. Do NOT use JavaScript string concatenation."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        model: model,
        temperature: 0.1,
        max_tokens: 4096,
        top_p: 1,
        stream: false,
        stop: null
    };

    const url = `https://api.groq.com/openai/v1/chat/completions`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_KEY}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorText = await res.text();
            return {
                error: `Groq API error ${res.status}: ${errorText || res.statusText}`
            };
        }

        return await res.json();
    } catch (err) {
        return { error: err.message };
    }
}

/* ----------------------------------------------------------
   HIGH LEVEL: Main backend function — generateConfig()
-----------------------------------------------------------*/
async function generateConfig(options) {
    const { languages, packages, aiModel = DEFAULT_MODEL } = options;

    const prompt = `
You are a development environment configuration generator. Generate a Dockerfile, devcontainer.json, and dependency list.

Requirements:
Languages: ${languages.join(", ")}
Packages: ${packages.join(", ")}

You MUST respond with ONLY a JSON object in this exact structure:

{
  "dockerfile": "Your Dockerfile content here. Use \\n for newlines.",
  "devcontainer": "Your devcontainer.json content here as a string. Use \\n for newlines.",
  "dependencies": "List of dependencies here"
}

Important guidelines:
1. Return ONLY the JSON object.
2. NO MARKDOWN formatting, NO backticks.
3. CRITICAL: Do NOT use JavaScript-style string concatenation (e.g., 'str' + 'ing'). Write long strings as a single valid JSON string using \\n for line breaks.
`;

    const ai = await callGroq(prompt, aiModel);

    if (ai.error) return { error: ai.error };

    let rawText = "";

    try {
        rawText = ai.choices?.[0]?.message?.content || "";
        console.log("Raw AI Response:", rawText);
    } catch (e) {
        return { error: "Invalid AI response format" };
    }

    if (!rawText.trim()) {
        return { error: "Empty response from AI" };
    }

    // Helper: Strip ANSI codes
    function stripAnsi(str) {
        return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    }

    let cleanText = stripAnsi(rawText);

    // Helper: Repair JSON with unescaped newlines in strings
    function repairJSON(jsonStr) {
        try {
            return jsonStr.replace(/"((?:[^"\\]|\\.)*)"/g, (match, content) => {
                const cleaned = content.replace(/\n/g, '\\n').replace(/\r/g, '');
                return `"${cleaned}"`;
            });
        } catch (e) {
            return jsonStr;
        }
    }

    let parsed = null;

    // Strategy 1: Clean Markdown & Direct Parse
    try {
        let jsonCandidate = cleanText.trim();
        const markdownMatch = jsonCandidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (markdownMatch) {
            jsonCandidate = markdownMatch[1];
        } else {
            const start = jsonCandidate.indexOf('{');
            const end = jsonCandidate.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                jsonCandidate = jsonCandidate.substring(start, end + 1);
            }
        }

        parsed = JSON.parse(repairJSON(jsonCandidate.trim()));
    } catch (e1) {
        // Strategy 2: Permissive Regex Extraction
        console.log("JSON parsing failed, attempting permissive regex extraction...");

        const extractField = (keyName) => {
            // Simplified Regex to handle standard "key": "value" without complex multi-line concatenation support
            // This prevents the "Unterminated group" syntax error from complex nested regexes
            // We use \\\\ in JS string to produce \\ in Regex, which matches a literal backslash inside []
            const pattern = new RegExp(`["']${keyName}["']\\s*:\\s*["']((?:[^"'\\\\\\\\]|\\\\.)*)["']`, 'i');
            const m = cleanText.match(pattern);
            if (m) return m[1];
            return null;
        };

        const dockerfile = extractField('dockerfile');
        const devcontainer = extractField('devcontainer');
        const dependencies = extractField('dependencies');

        if (dockerfile || devcontainer) {
            parsed = {
                dockerfile: dockerfile ? dockerfile.replace(/\\n/g, '\n').replace(/\\"/g, '"') : "",
                devcontainer: devcontainer ? devcontainer.replace(/\\n/g, '\n').replace(/\\"/g, '"') : "{}",
                dependencies: dependencies ? dependencies.replace(/\\n/g, '\n').replace(/\\"/g, '"') : ""
            };
        }
    }

    if (parsed) {
        if (parsed.devcontainer && typeof parsed.devcontainer === 'object') {
            parsed.devcontainer = JSON.stringify(parsed.devcontainer, null, 2);
        }

        return parsed;
    }

    console.error("FAILED PARSING. Raw text was:", rawText);
    return {
        error: "Failed to parse AI JSON response",
        raw: cleanText.substring(0, 500) + "..."
    };
}

module.exports = { callGroq, generateConfig, DEFAULT_MODEL };
