// backend/test_ipc.js
console.log("Launching Electron backend IPC test...");

const { spawn } = require("child_process");
const path = require("path");

// Run Electron in test mode
const electronPath = require("electron");

const child = spawn(electronPath, ["backend/ipc_test_runner.js"], {
  stdio: "inherit",
  env: { ...process.env, TEST_MODE: "1" }
});

child.on("exit", (code) => {
  console.log("Electron exited with code:", code);
});
