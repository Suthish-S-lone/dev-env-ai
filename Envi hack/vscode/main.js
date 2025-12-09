const { app, BrowserWindow, ipcMain, Menu, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let terminalProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/images/vscode-icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../welcome.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Window state events
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized');
  });
}

// Terminal IPC Handlers
ipcMain.on('terminal-create', (event) => {
  const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';

  if (terminalProcess) {
    terminalProcess.kill();
  }

  terminalProcess = spawn(shell, [], {
    cwd: process.cwd(),
    env: process.env,
    shell: true
  });

  terminalProcess.stdout.on('data', (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal-incoming', data.toString());
    }
  });

  terminalProcess.stderr.on('data', (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal-incoming', data.toString());
    }
  });

  terminalProcess.on('exit', (code) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal-incoming', `\r\nTerminal exited with code ${code}\r\n`);
    }
  });
});

ipcMain.on('terminal-write', (event, data) => {
  if (terminalProcess && terminalProcess.stdin) {
    terminalProcess.stdin.write(data);
  }
});

// IPC Handlers
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error writing file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-file', async (event, filePath) => {
  console.log('IPC: create-file called for:', filePath);
  try {
    fs.writeFileSync(filePath, '');
    return { success: true };
  } catch (error) {
    console.error('IPC: create-file failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-folder', async (event, folderPath) => {
  try {
    fs.mkdirSync(folderPath, { recursive: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    return items.map(item => ({
      name: item.name,
      path: path.join(dirPath, item.name),
      isDirectory: item.isDirectory(),
      isFile: item.isFile()
    }));
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
});

ipcMain.handle('delete-file', async (event, filePath) => {
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fs.rmdirSync(filePath, { recursive: true });
    } else {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('rename-file', async (event, oldPath, newPath) => {
  try {
    fs.renameSync(oldPath, newPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections']
  });
  return result.filePaths;
});

ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths;
});

ipcMain.handle('save-file-dialog', async (event, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath
  });
  return result.filePath;
});

const { generateConfig } = require('./backend/aiGenerator');
const { installDirect } = require('./backend/systemInstaller');

ipcMain.handle('generate-environment', async (event, options) => {
  console.log(`Generating environment for:`, options);



  // Helper to send logs to terminal
  const logToTerminal = (message) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal-incoming', message);
    }
  };

  const config = options || { languages: ['python'], packages: ['flask'] };

  try {
    logToTerminal(`\r\n\x1b[36m> Initializing AI Environment Generator...\x1b[0m\r\n`);
    logToTerminal(`\r\n\x1b[33m> Target: ${config.languages.join(', ')} [${config.packages.join(', ')}]\x1b[0m\r\n`);

    // Use user's Documents folder for projects to ensure they are saved on system disk
    let projectsRoot;
    if (config.customPath) {
      projectsRoot = config.customPath;
    } else {
      const documentsPath = app.getPath('documents');
      projectsRoot = path.join(documentsPath, 'EnviProjects');
    }

    // Use project name from config or default to 'generated-env'
    const projectName = config.name || 'generated-env';
    const targetDir = path.join(projectsRoot, projectName);

    // Create configs if they don't exist
    if (!fs.existsSync(projectsRoot)) {
      fs.mkdirSync(projectsRoot, { recursive: true });
    }

    const dockerfilePath = path.join(targetDir, 'Dockerfile');

    let result;

    // Check for existing files but DO NOT skip generation (as per user request)
    // We want to force regeneration if the user asks for it.
    if (fs.existsSync(dockerfilePath)) {
      logToTerminal(`\r\n\x1b[33m> Environment exists in ${targetDir}. Regenerating as requested...\x1b[0m\r\n`);
    } else {
      logToTerminal(`\r\n\x1b[36m> Creating new environment in ${targetDir}...\x1b[0m\r\n`);
    }

    // 1. Generate Configs
    logToTerminal(`\r\n> Requesting configuration from Gemini/Groq AI...\r\n`);
    result = await generateConfig(config);

    if (result.error) {
      const errorMsg = typeof result.error === 'object'
        ? JSON.stringify(result.error, null, 2)
        : result.error;
      throw new Error(errorMsg);
    }

    // 2. Write Files
    // targetDir is already defined above
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }

    if (result.dockerfile) {
      const content = typeof result.dockerfile === 'string'
        ? result.dockerfile
        : JSON.stringify(result.dockerfile, null, 2); // Fallback if AI returns object (unlikely for Dockerfile but safe)
      fs.writeFileSync(path.join(targetDir, 'Dockerfile'), content);
      logToTerminal(`\r\n\x1b[32m✔ Created Dockerfile\x1b[0m\r\n`);
    }

    if (result.devcontainer) {
      const content = typeof result.devcontainer === 'string'
        ? result.devcontainer
        : JSON.stringify(result.devcontainer, null, 2);
      fs.writeFileSync(path.join(targetDir, 'devcontainer.json'), content);
      logToTerminal(`\r\n\x1b[32m✔ Created devcontainer.json\x1b[0m\r\n`);
    }

    if (result.dependencies) {
      let content = result.dependencies;
      if (Array.isArray(content)) {
        content = content.join('\n');
      } else if (typeof content === 'object') {
        content = JSON.stringify(content, null, 2);
      }
      fs.writeFileSync(path.join(targetDir, 'requirements.txt'), content);
      logToTerminal(`\r\n\x1b[32m✔ Created requirements.txt / package.json\x1b[0m\r\n`);
    }

    logToTerminal(`\r\n\x1b[32m★ Environment generation complete in ${targetDir}\x1b[0m\r\n`);

    result.targetDir = targetDir;
    return { success: true, data: result };

  } catch (err) {
    const finalMsg = err.message || JSON.stringify(err);
    logToTerminal(`\r\n\x1b[31m✖ Error: ${finalMsg}\x1b[0m\r\n`);
    return { success: false, error: finalMsg };
  }
});

// Window controls
ipcMain.on('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow.close();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});