const { generateConfig } = require("./aiGenerator");

async function main() {
  console.log("Testing AI generation (backend)...");

  try {
    const result = await generateConfig({
      languages: ["python"],
      packages: ["flask", "numpy"]
    });

    console.log("RESULT:", result);
  } catch (err) {
    console.error("Test generate error:", err);
  }
}

main();
