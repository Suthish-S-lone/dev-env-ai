const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const { generateEnvironment } = require("./backend/aiGenerator");
const { createProject, readDir, readFile, writeFile } = require("./backend/fileSystem");
const { runCommand } = require("./backend/commandRunner");

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.loadFile("frontend/index.html");
}

app.whenReady().then(createWindow);

// AI Generation
ipcMain.handle("generate-env", (e, opts) => {
    return generateEnvironment(opts);
});

// File operations
ipcMain.handle("read-dir", (e, dir) => readDir(dir));
ipcMain.handle("read-file", (e, f) => readFile(f));
ipcMain.handle("write-file", (e, f, c) => writeFile(f, c));
ipcMain.handle("create-project", (e, base, s) => createProject(base, s));

// Command runner
ipcMain.on("run-command", (event, { cmd, args }) => {
    runCommand(cmd, args, (data, type) => {
        event.sender.send("command-output", { data, type });
    });
});
