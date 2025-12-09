const { spawn, exec } = require('child_process');

// Map of friendly names to Winget IDs
const WINGET_MAP = {
    // Languages
    'python': 'Python.Python.3.11',
    'node.js': 'OpenJS.NodeJS',
    'javascript': 'OpenJS.NodeJS',
    'typescript': 'OpenJS.NodeJS',
    'java': 'Oracle.JDK.21',
    'c++': 'Microsoft.VisualStudio.2022.BuildTools',
    'rust': 'Rustlang.Rustup',
    'go': 'GoLang.Go',

    // Frameworks/Tools 
    'git': 'Git.Git',
    'docker': 'Docker.DockerDesktop',
    'vscode': 'Microsoft.VisualStudioCode'
};

function checkWinget() {
    return new Promise((resolve) => {
        exec('winget --version', (err) => {
            resolve(!err);
        });
    });
}

/**
 * Installs a package using winget and streams output.
 * @param {string} packageId 
 * @param {function} onData Callback for stdout/stderr data (string)
 */
function installPackage(packageId, onData) {
    return new Promise((resolve) => {
        if (onData) onData(`\r\n\x1b[36m> Installing ${packageId}...\x1b[0m\r\n`);

        // winget install --id <ID> -e --silent --accept-source-agreements --accept-package-agreements
        // NOTE: removed --silent to see progress, but winget progress bars might look messy in xterm without PTY
        // Let's keep it interactive? Or basic.
        // If we use spawn, we can capture output.
        // 'winget' might need shell: true on Windows

        const proc = spawn('winget', ['install', '--id', packageId, '-e', '--accept-source-agreements', '--accept-package-agreements'], {
            shell: true,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        proc.stdout.on('data', (data) => {
            if (onData) onData(data.toString());
        });

        proc.stderr.on('data', (data) => {
            if (onData) onData(data.toString());
        });

        proc.on('close', (code) => {
            if (code === 0) {
                if (onData) onData(`\r\n\x1b[32m✔ Successfully installed ${packageId}\x1b[0m\r\n`);
                resolve({ success: true, package: packageId });
            } else {
                if (onData) onData(`\r\n\x1b[31m✖ Failed to install ${packageId} (Exit Code: ${code})\x1b[0m\r\n`);
                resolve({ success: false, package: packageId, error: `Exit code ${code}` });
            }
        });

        proc.on('error', (err) => {
            if (onData) onData(`\r\n\x1b[31m✖ Error spawning winget: ${err.message}\x1b[0m\r\n`);
            resolve({ success: false, package: packageId, error: err.message });
        });
    });
}

async function installDirect(selections, onData) {
    const hasWinget = await checkWinget();
    if (!hasWinget) {
        if (onData) onData("\r\n\x1b[31mError: Winget is not installed or not in PATH.\x1b[0m\r\n");
        return { success: false, error: "Winget is not installed or not in PATH." };
    }

    const { languages, frameworks, libraries } = selections;
    const allItems = [...(languages || []), ...(frameworks || []), ...(libraries || [])];
    const uniqueItems = [...new Set(allItems.map(i => i.toLowerCase()))];

    if (onData) onData(`\r\n\x1b[33mStarting installation for: ${uniqueItems.join(', ')}\x1b[0m\r\n`);

    const results = [];

    for (const item of uniqueItems) {
        const wingetId = WINGET_MAP[item];
        if (wingetId) {
            const res = await installPackage(wingetId, onData);
            results.push(res);
        } else {
            if (onData) onData(`\r\n\x1b[33m⚠ No installer mapping found for '${item}'. Skipping...\x1b[0m\r\n`);
            results.push({ success: false, package: item, error: "No package ID found" });
        }
    }

    if (onData) onData(`\r\n\x1b[32mInstallation process completed.\x1b[0m\r\n`);

    return { success: true, results };
}

module.exports = { installDirect };
