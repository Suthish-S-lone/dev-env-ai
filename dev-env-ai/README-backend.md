DevSet — Backend README
=======================

Prerequisites
-------------
- Node.js 18.x recommended
- Python (if building native modules) — required when installing node-pty
- On Windows: Visual Studio Build Tools with "Desktop dev with C++" and Windows SDK if node-pty needs compiling.

Install
-------
1. Copy .env.example -> .env and insert GEMINI_API_KEY.
2. Run:
   npm install

If node-pty fails during npm install, ensure:
- You have the correct Node version (18 recommended)
- Visual Studio Build Tools + Windows SDK installed (Windows)
- Python 3.x installed and in PATH

Testing AI generation (no frontend)
----------------------------------
- Ensure .env contains GEMINI_API_KEY
- Run:
  npm run test:ai

This will call the Gemini endpoints (requires valid key & network). It prints the returned JSON.

Testing terminal (node-pty)
---------------------------
- Run:
  npm run test:pty

You should see output from a spawned shell (hello message and uname/node version). If you get build errors, re-check prerequisites.

Integrating into Electron
-------------------------
- Use the included modules in Electron's main process:
  const { generateConfig } = require('./backend/aiGenerator');
  const terminalManager = require('./backend/terminalManager');

- Use IPC to expose needed functions to renderer. Example (main process):
  ipcMain.handle('generate-config', (e, data) => generateConfig(data));
  ipcMain.handle('spawn-pty', (e, shell, cwd) => {
    return terminalManager.spawn(shell, cwd, (d) => e.sender.send(`pty-data-${id}`, d));
  });

Security note
-------------
- Keep `.env` secret.
- When packaging an Electron app, configure contextIsolation and avoid enabling nodeIntegration in production unless you implement a safe preload bridge.

If you want, I can also provide the exact `main.js` + `preload.js` + tiny test-electron script wired to these modules for easy integration.

