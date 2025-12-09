const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    generateEnv: (opts) => ipcRenderer.invoke("generate-env", opts),

    readDir: (dir) => ipcRenderer.invoke("read-dir", dir),
    readFile: (file) => ipcRenderer.invoke("read-file", file),
    writeFile: (file, content) => ipcRenderer.invoke("write-file", file, content),
    createProject: (base, struct) => ipcRenderer.invoke("create-project", base, struct),

    runCommand: (cmd, args) => ipcRenderer.send("run-command", { cmd, args }),
    onCommandOutput: (callback) =>
        ipcRenderer.on("command-output", (event, data) => callback(data)),
});
