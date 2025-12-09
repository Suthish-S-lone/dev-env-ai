const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // File operations
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', path, content),
  createFile: (path) => ipcRenderer.invoke('create-file', path),
  createFolder: (path) => ipcRenderer.invoke('create-folder', path),
  deleteFile: (path) => ipcRenderer.invoke('delete-file', path),
  renameFile: (oldPath, newPath) => ipcRenderer.invoke('rename-file', oldPath, newPath),

  // Directory operations
  readDirectory: (path) => ipcRenderer.invoke('read-directory', path),

  // Dialog operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  saveFileDialog: (defaultPath) => ipcRenderer.invoke('save-file-dialog', defaultPath),

  // Environment operations
  generateEnvironment: (type) => ipcRenderer.invoke('generate-environment', type),

  // Terminal operations
  createTerminal: () => ipcRenderer.send('terminal-create'),
  writeTerminal: (data) => ipcRenderer.send('terminal-write', data),
  onTerminalData: (callback) => ipcRenderer.on('terminal-incoming', (event, data) => callback(data)),

  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Events
  onWindowMaximized: (callback) => ipcRenderer.on('window-maximized', callback),
  onWindowUnmaximized: (callback) => ipcRenderer.on('window-unmaximized', callback)
});