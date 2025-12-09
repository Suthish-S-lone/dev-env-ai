class Renderer {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupGlobalEventDelegation();
        this.setupTheme();
        this.initializeComponents();
        this.showWelcome();
    }

    showWelcome() {
        console.log('Welcome to Code Editor');
        // Optional: Show a welcome notification or status
        if (window.statusBarManager) {
            window.statusBarManager.showNotification('Welcome to Code Editor', 'info');
        }
    }

    setupEventListeners() {
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('focus', () => this.handleWindowFocus());
        window.addEventListener('blur', () => this.handleWindowBlur());

        // Bottom panel tab switching (Terminal / Problems / Output / Debug Console / Ports)
        document.addEventListener('click', (e) => {
            const panelTab = e.target.closest('.panel-tab');
            if (!panelTab) return;

            const targetPanel = panelTab.dataset.panel;
            // Toggle active tab styles
            document.querySelectorAll('.panel-tab').forEach(tab => {
                tab.classList.toggle('active', tab === panelTab);
            });

            // Show matching panel view
            document.querySelectorAll('.panel-view').forEach(view => {
                view.classList.toggle('active', view.id === `${targetPanel}-view`);
            });

            // Keep the terminal responsive when shown
            if (targetPanel === 'terminal' && window.xtermSetup) {
                window.xtermSetup.resize();
                window.xtermSetup.focus();
            }
        });

        // Prevent default drag behaviors
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
        });

        // Listen for file open events from explorer
        document.addEventListener('file-open', (e) => {
            if (window.editorManager) {
                window.editorManager.openFile(e.detail.path, e.detail.content);
            }
        });

        // Run Button Listener
        const runBtn = document.getElementById('run-btn');
        if (runBtn) {
            runBtn.addEventListener('click', () => {
                this.runCode();
            });
        }
    }

    setupGlobalEventDelegation() {
        // Handle tab close button clicks
        document.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('.editor-tab-close');
            if (closeBtn) {
                e.stopPropagation();
                const tab = closeBtn.closest('.editor-tab');
                if (tab && window.tabManager) {
                    window.tabManager.closeTab(tab.dataset.id);
                }
            }

            // Handle panel tab clicks
            const panelTab = e.target.closest('.panel-tab');
            if (panelTab && window.sidebarManager) {
                const panel = panelTab.dataset.panel;
                window.sidebarManager.switchPanel(panel);
            }

            // Handle activity bar clicks
            const activityItem = e.target.closest('.activity-bar-item');
            if (activityItem && window.sidebarManager) {
                const view = activityItem.dataset.view;
                window.sidebarManager.switchView(view);
            }

            // Handle editor action buttons
            const actionBtn = e.target.closest('.editor-action-btn');
            if (actionBtn) {
                console.log('Editor action button clicked:', actionBtn.id);
                const action = actionBtn.id;
                this.handleEditorAction(action);
            }
        });

        // Handle context menu
        document.addEventListener('contextmenu', (e) => {
            // Prevent default context menu in editor area
            if (e.target.closest('.editor-container') ||
                e.target.closest('.file-explorer')) {
                e.preventDefault();
            }
        });
    }

    setupTheme() {
        // Set initial theme
        document.body.setAttribute('data-theme', 'dark');

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }
    }

    initializeComponents() {
        // Initialize all components
        console.log('Initializing Code Editor...');

        // Set initial status
        if (window.statusBarManager) {
            window.statusBarManager.showNotification('Ready', 'success');
        }

        // Register default commands
        this.registerCommands();
    }

    registerCommands() {
        if (!window.commandPalette) return;

        // File Commands
        window.commandPalette.registerCommand('file.new', 'File: New File', () => window.fileOperations?.createNewFile(), 'Ctrl+N');
        window.commandPalette.registerCommand('file.open', 'File: Open File...', () => window.fileOperations?.openFile(), 'Ctrl+O');
        window.commandPalette.registerCommand('file.openFolder', 'File: Open Folder...', () => window.fileOperations?.openFolder(), 'Ctrl+K Ctrl+O');
        window.commandPalette.registerCommand('file.save', 'File: Save', () => window.fileOperations?.saveFile(), 'Ctrl+S');

        // View Commands
        window.commandPalette.registerCommand('view.commandPalette', 'View: Command Palette', () => window.commandPalette.toggle(), 'Ctrl+Shift+P');
        window.commandPalette.registerCommand('view.explorer', 'View: Show Explorer', () => window.sidebarManager?.switchView('explorer'), 'Ctrl+Shift+E');
        window.commandPalette.registerCommand('view.search', 'View: Show Search', () => window.sidebarManager?.switchView('search'), 'Ctrl+Shift+F');
        window.commandPalette.registerCommand('view.terminal', 'View: Toggle Terminal', () => document.querySelector('.panel-tab[data-panel="terminal"]')?.click(), 'Ctrl+`');

        // Run Command
        window.commandPalette.registerCommand('code.run', 'Run Code', () => this.runCode(), 'Ctrl+Alt+N');

        // Editor Commands
        window.commandPalette.registerCommand('editor.format', 'Editor: Format Document', () => {
            if (window.editorManager) {
                window.editorManager.formatDocument();
            }
        }, 'Shift+Alt+F');

        // Window events
        window.addEventListener('resize', () => this.handleResize());
        // Show welcome message in terminal
        setTimeout(() => {
            if (window.xtermSetup) {
                // Already showing welcome in terminal setup
            }
        }, 1000);
    }

    handleResize() {
        // Handle window resize
        if (window.xtermSetup) {
            window.xtermSetup.resize();
        }

        // Update editor layout
        if (window.monacoEditor) {
            window.monacoEditor.layout();
        }
    }

    handleWindowFocus() {
        document.body.classList.remove('window-blurred');
    }

    handleWindowBlur() {
        document.body.classList.add('window-blurred');
    }

    handleEditorAction(action) {
        switch (action) {
            case 'open-file-action':
                if (window.fileOperations) {
                    window.fileOperations.openFile();
                }
                break;
            case 'open-folder-action':
                if (window.fileOperations) {
                    window.fileOperations.openFolder();
                }
                break;
            case 'new-file-action':
                if (window.fileOperations) {
                    window.fileOperations.createNewFile();
                }
                break;
        }
    }

    // Utility methods
    showLoading(message = 'Loading...') {
        const loading = document.createElement('div');
        loading.id = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;

        Object.assign(loading.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(30, 30, 30, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        });

        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('loading-overlay');
        if (loading) {
            loading.remove();
        }
    }

    showError(message, details = '') {
        const errorDialog = document.createElement('div');
        errorDialog.className = 'error-dialog';
        errorDialog.innerHTML = `
            <div class="error-header">
                <i class="fas fa-exclamation-circle"></i>
                <span>Error</span>
            </div>
            <div class="error-message">${message}</div>
            ${details ? `<div class="error-details">${details}</div>` : ''}
            <div class="error-actions">
                <button class="error-btn ok-btn">OK</button>
                ${details ? `<button class="error-btn details-btn">Details</button>` : ''}
            </div>
        `;

        // Style the error dialog
        Object.assign(errorDialog.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--menu-background)',
            border: '1px solid var(--menu-border)',
            borderRadius: '4px',
            padding: '20px',
            minWidth: '300px',
            maxWidth: '500px',
            zIndex: 10000,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        });

        document.body.appendChild(errorDialog);

        // Add event listeners
        errorDialog.querySelector('.ok-btn').addEventListener('click', () => {
            errorDialog.remove();
        });

        const detailsBtn = errorDialog.querySelector('.details-btn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => {
                const detailsEl = errorDialog.querySelector('.error-details');
                detailsEl.style.display = detailsEl.style.display === 'none' ? 'block' : 'none';
            });
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        if (window.statusBarManager) {
            window.statusBarManager.showNotification(message, type, duration);
        }
    }

    // File operations
    async openRecentFile(index) {
        if (window.fileOperations) {
            return await window.fileOperations.openRecentFile(index);
        }
        return null;
    }

    async openRecentFolder(index) {
        if (window.fileOperations) {
            return await window.fileOperations.openRecentFolder(index);
        }
        return null;
    }

    // Theme management
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update Monaco theme if available
        if (window.monacoEditor) {
            const themeName = theme === 'dark' ? 'vs-code-dark' : 'vs';
            monaco.editor.setTheme(themeName);
        }

        this.showNotification(`Theme changed to ${theme}`, 'info');
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    // Workspace management
    getCurrentWorkspace() {
        if (window.fileOperations) {
            return window.fileOperations.getCurrentWorkspace();
        }
        return null;
    }

    setCurrentWorkspace(path) {
        if (window.fileOperations) {
            window.fileOperations.setCurrentWorkspace(path);
        }
    }

    // Editor utilities
    getCurrentEditorContent() {
        if (window.editorManager) {
            return window.editorManager.getCurrentContent();
        }
        return '';
    }

    getCurrentLanguage() {
        if (window.editorManager) {
            return window.editorManager.getCurrentLanguage();
        }
        return null;
    }

    // Terminal utilities
    executeTerminalCommand(command) {
        if (window.xtermSetup) {
            window.xtermSetup.executeCommand(command);
        }
    }

    async runCode() {
        const editorContent = this.getCurrentEditorContent();
        const language = this.getCurrentLanguage();
        const filePath = window.editorManager ? window.editorManager.getCurrentFilePath() : null;

        if (!editorContent) {
            this.showNotification('No code to run', 'warning');
            return;
        }

        // Save file before running
        if (filePath) {
            if (window.editorManager) {
                await window.editorManager.saveCurrentFile();
            }
        } else {
            // Need a file path to run most things (except maybe raw node/python evaluation, but keeping it simple)
            this.showNotification('Please save the file first', 'info');
            // Trigger save dialog
            if (window.fileOperations) {
                await window.fileOperations.saveFile();
                // If still no file path (user cancelled), return
                if (!window.editorManager.getCurrentFilePath()) return;
            } else {
                return;
            }
        }

        // Get fresh file path after potential save
        const currentFilePath = window.editorManager.getCurrentFilePath();
        if (!currentFilePath) return;

        // Ensure terminal is visible
        const terminalTab = document.querySelector('.panel-tab[data-panel="terminal"]');
        if (terminalTab) terminalTab.click();

        // Clear terminal (optional, creates a cleaner run)
        // this.clearTerminal(); 

        let command = '';
        const fileName = currentFilePath.split(/[\\/]/).pop();
        const dirPath = currentFilePath.substring(0, currentFilePath.lastIndexOf(fileName) - 1); // remove trailing slash check
        // Safer dir path extraction
        const directory = currentFilePath.substring(0, currentFilePath.lastIndexOf((currentFilePath.includes('\\') ? '\\' : '/')));

        // Escape paths for Windows/Unix
        const safeFilePath = `"${currentFilePath}"`;
        const safeDir = `"${directory}"`;

        switch (language) {
            case 'javascript':
                command = `node ${safeFilePath}`;
                break;
            case 'python':
                // Try python3 first, then python (or check platform)
                // For Windows usually 'python'
                command = `python ${safeFilePath}`;
                break;
            case 'java':
                // Java requires compiling then running, or 'java file.java' in newer versions
                // We will try single file source code mode (Java 11+)
                command = `java ${safeFilePath}`;
                break;
            case 'c':
                // gcc input -o output && output
                // Need to handle extension stripping
                const outNameC = fileName.replace(/\.[^/.]+$/, "");
                const outPathC = `"${directory}/${outNameC}"`; // Simplified, might need platform adjustments
                if (navigator.platform.indexOf('Win') > -1) {
                    command = `gcc ${safeFilePath} -o ${outNameC} && .\\${outNameC}`;
                } else {
                    command = `gcc ${safeFilePath} -o ${outNameC} && ./${outNameC}`;
                }
                break;
            case 'cpp':
                const outNameCpp = fileName.replace(/\.[^/.]+$/, "");
                if (navigator.platform.indexOf('Win') > -1) {
                    command = `g++ ${safeFilePath} -o ${outNameCpp} && .\\${outNameCpp}`;
                } else {
                    command = `g++ ${safeFilePath} -o ${outNameCpp} && ./${outNameCpp}`;
                }
                break;
            case 'html':
                // Open in browser
                if (navigator.platform.indexOf('Win') > -1) {
                    command = `start ${safeFilePath}`;
                } else if (navigator.platform.indexOf('Mac') > -1) {
                    command = `open ${safeFilePath}`;
                } else {
                    command = `xdg-open ${safeFilePath}`;
                }
                break;
            case 'batch':
            case 'bat':
                command = safeFilePath;
                break;
            case 'powershell':
                command = `powershell -ExecutionPolicy Bypass -File ${safeFilePath}`;
                break;
            default:
                this.showNotification(`Running ${language} is not yet supported.`, 'warning');
                return;
        }

        if (command) {
            this.showNotification(`Running ${fileName}...`, 'info');
            this.executeTerminalCommand(command + '\r'); // Add return to execute
        }
    }

    clearTerminal() {
        if (window.xtermSetup) {
            window.xtermSetup.clear();
        }
    }

    // Shortcut utilities
    registerShortcut(keyCombo, description, handler) {
        if (window.keyboardShortcuts) {
            window.keyboardShortcuts.addCustomShortcut(keyCombo, description, handler);
        }
    }

    showShortcutHelp() {
        if (window.keyboardShortcuts) {
            window.keyboardShortcuts.showShortcutHelp();
        }
    }

    // Cleanup
    cleanup() {
        // Clean up resources before window close
        if (window.editorManager) {
            window.editorManager.dispose();
        }

        if (window.xtermSetup && window.xtermSetup.terminal) {
            window.xtermSetup.terminal.dispose();
        }
    }
}

// Initialize renderer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.renderer = new Renderer();

    // Export global API
    window.vscode = {
        openFile: (path) => window.fileOperations?.openFile(path),
        openFolder: (path) => window.fileOperations?.openFolder(path),
        saveFile: () => window.fileOperations?.saveFile(),
        executeCommand: (cmd) => window.xtermSetup?.executeCommand(cmd),
        showNotification: (msg, type) => window.renderer?.showNotification(msg, type),
        getCurrentContent: () => window.renderer?.getCurrentEditorContent(),
        setTheme: (theme) => window.renderer?.setTheme(theme)
    };
});

// Handle beforeunload
window.addEventListener('beforeunload', () => {
    if (window.renderer) {
        window.renderer.cleanup();
    }
});