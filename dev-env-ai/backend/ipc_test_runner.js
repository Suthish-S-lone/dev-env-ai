// backend/ipc_test_runner.js

console.log("IPC Test Runner started.");
require("dotenv").config();

const { ipcMain, app, BrowserWindow } = require("electron");
const path = require("path");

const { generateConfig } = require("./aiGenerator");
const { spawnPty } = require("./terminalManager");

async function runTests() {
  console.log("\n=== IPC BACKEND TEST START ===\n");

  console.log("Testing AI generator...");
  const aiResult = await generateConfig({
    languages: ["python"],
    packages: ["numpy"]
  });
  console.log("AI RESULT:", aiResult);

  console.log("\nTesting PTY spawn...");
  try {
    const pty = spawnPty();
    pty.onData((d) => console.log("PTY:", d));
    pty.write("echo Hello World\r");
    setTimeout(() => pty.kill(), 500);
  } catch (err) {
    console.error("PTY Error:", err);
  }

  console.log("\nIPC Test completed.");
  app.quit();
}

app.whenReady().then(() => runTests());
