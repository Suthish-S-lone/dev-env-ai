class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.init();
    }

    init() {
        this.registerDefaultShortcuts();
        this.bindGlobalShortcuts();
        this.loadCustomShortcuts();
    }

    registerDefaultShortcuts() {
        // File operations
        this.register('ctrl+n', 'New File', () => this.handleNewFile());
        this.register('ctrl+o', 'Open File', () => this.handleOpenFile());
        this.register('ctrl+s', 'Save', () => this.handleSave());
        this.register('ctrl+shift+s', 'Save As', () => this.handleSaveAs());
        this.register('ctrl+w', 'Close Tab', () => this.handleCloseTab());
        this.register('ctrl+shift+w', 'Close Window', () => window.api.closeWindow());

        // Edit operations
        this.register('ctrl+z', 'Undo', () => this.handleUndo());
        this.register('ctrl+y', 'Redo', () => this.handleRedo());
        this.register('ctrl+x', 'Cut', () => this.handleCut());
        this.register('ctrl+c', 'Copy', () => this.handleCopy());
        this.register('ctrl+v', 'Paste', () => this.handlePaste());
        this.register('ctrl+a', 'Select All', () => this.handleSelectAll());
        this.register('ctrl+f', 'Find', () => this.handleFind());
        this.register('ctrl+h', 'Replace', () => this.handleReplace());
        this.register('ctrl+/', 'Toggle Comment', () => this.handleToggleComment());

        // Navigation
        this.register('ctrl+p', 'Command Palette', () => this.handleCommandPalette());
        this.register('ctrl+shift+e', 'Toggle Explorer', () => this.handleToggleExplorer());
        this.register('ctrl+shift+f', 'Toggle Search', () => this.handleToggleSearch());
        this.register('ctrl+shift+g', 'Toggle Source Control', () => this.handleToggleGit());
        this.register('ctrl+shift+d', 'Toggle Debug', () => this.handleToggleDebug());
        this.register('ctrl+shift+x', 'Toggle Extensions', () => this.handleToggleExtensions());
        this.register('ctrl+`', 'Toggle Terminal', () => this.handleToggleTerminal());
        this.register('ctrl+b', 'Toggle Sidebar', () => this.handleToggleSidebar());

        // Editor navigation
        this.register('f12', 'Go to Definition', () => this.handleGoToDefinition());
        this.register('ctrl+g', 'Go to Line', () => this.handleGoToLine());
        this.register('ctrl+f12', 'Go to Implementation', () => this.handleGoToImplementation());
        this.register('shift+f12', 'Go to References', () => this.handleGoToReferences());

        // Run/debug
        this.register('f5', 'Start Debugging', () => this.handleStartDebugging());
        this.register('ctrl+f5', 'Run Without Debugging', () => this.handleRunWithoutDebugging());
        this.register('shift+f5', 'Stop Debugging', () => this.handleStopDebugging());
        this.register('f9', 'Toggle Breakpoint', () => this.handleToggleBreakpoint());
        this.register('f10', 'Step Over', () => this.handleStepOver());
        this.register('f11', 'Step Into', () => this.handleStepInto());
        this.register('shift+f11', 'Step Out', () => this.handleStepOut());

        // Terminal
        this.register('ctrl+shift+`', 'New Terminal', () => this.handleNewTerminal());
        this.register('ctrl+shift+5', 'Split Terminal', () => this.handleSplitTerminal());

        // Window
        this.register('ctrl+shift+n', 'New Window', () => this.handleNewWindow());
        this.register('ctrl+shift+p', 'Show All Commands', () => this.handleShowAllCommands());
        this.register('ctrl+,', 'Open Settings', () => this.handleOpenSettings());

        // Search
        this.register('ctrl+shift+f', 'Find in Files', () => this.handleFindInFiles());
        this.register('ctrl+shift+h', 'Replace in Files', () => this.handleReplaceInFiles());
    }

    register(keyCombo, description, handler, context = 'global') {
        const shortcut = {
            keyCombo,
            description,
            handler,
            context,
            enabled: true
        };

        this.shortcuts.set(keyCombo.toLowerCase(), shortcut);
    }

    unregister(keyCombo) {
        this.shortcuts.delete(keyCombo.toLowerCase());
    }

    bindGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.isContentEditable) {
                return;
            }

            const keyCombo = this.getKeyCombo(e);
            const shortcut = this.shortcuts.get(keyCombo);

            if (shortcut && shortcut.enabled) {
                e.preventDefault();
                e.stopPropagation();

                try {
                    shortcut.handler();
                } catch (error) {
                    console.error('Error executing shortcut:', error);
                }
            }
        });
    }

    getKeyCombo(event) {
        const parts = [];

        if (event.ctrlKey || event.metaKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');

        // Handle special keys
        let key = event.key.toLowerCase();

        // Map some keys to simpler names
        const keyMap = {
            'escape': 'esc',
            'control': 'ctrl',
            ' ': 'space',
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right',
            '`': 'backquote',
            '\\': 'backslash',
            '[': 'bracketleft',
            ']': 'bracketright',
            ';': 'semicolon',
            "'": 'quote',
            ',': 'comma',
            '.': 'period',
            '/': 'slash'
        };

        key = keyMap[key] || key;

        // Skip modifier keys in the combo
        if (!['ctrl', 'alt', 'shift', 'meta'].includes(key)) {
            parts.push(key);
        }

        return parts.join('+');
    }

    loadCustomShortcuts() {
        try {
            const custom = localStorage.getItem('keyboardShortcuts');
            if (custom) {
                const shortcuts = JSON.parse(custom);
                shortcuts.forEach(shortcut => {
                    this.register(shortcut.keyCombo, shortcut.description,
                        this.createHandlerFromString(shortcut.handler), shortcut.context);
                });
            }
        } catch (error) {
            console.error('Error loading custom shortcuts:', error);
        }
    }

    saveCustomShortcuts() {
        const shortcuts = Array.from(this.shortcuts.values())
            .filter(s => s.context === 'custom');

        try {
            localStorage.setItem('keyboardShortcuts', JSON.stringify(shortcuts));
        } catch (error) {
            console.error('Error saving custom shortcuts:', error);
        }
    }

    createHandlerFromString(handlerString) {
        // Convert string representation of handler to actual function
        // This is a simplified version
        return () => {
            console.log('Custom handler:', handlerString);
            // In a real app, you would parse and execute the handler
        };
    }

    // Shortcut handlers
    handleNewFile() {
        if (window.fileOperations) {
            window.fileOperations.createNewFile();
        }
    }

    handleOpenFile() {
        if (window.fileOperations) {
            window.fileOperations.openFile();
        }
    }

    handleSave() {
        if (window.fileOperations) {
            window.fileOperations.saveFile();
        }
    }

    handleSaveAs() {
        if (window.fileOperations) {
            window.fileOperations.saveFileAs();
        }
    }

    handleCloseTab() {
        if (window.tabManager && window.tabManager.activeTab) {
            window.tabManager.closeTab(window.tabManager.activeTab.id);
        }
    }

    handleUndo() {
        if (window.monacoEditor) {
            window.monacoEditor.trigger('keyboard', 'undo', null);
        }
    }

    handleRedo() {
        if (window.monacoEditor) {
            window.monacoEditor.trigger('keyboard', 'redo', null);
        }
    }

    handleCut() {
        if (window.monacoEditor) {
            window.monacoEditor.trigger('keyboard', 'editor.action.clipboardCutAction', null);
        }
    }

    handleCopy() {
        if (window.monacoEditor) {
            window.monacoEditor.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
        }
    }

    handlePaste() {
        if (window.monacoEditor) {
            window.monacoEditor.trigger('keyboard', 'editor.action.clipboardPasteAction', null);
        }
    }

    handleSelectAll() {
        if (window.monacoEditor) {
            window.monacoEditor.trigger('keyboard', 'editor.action.selectAll', null);
        }
    }

    handleFind() {
        if (window.monacoEditor) {
            window.monacoEditor.trigger('keyboard', 'actions.find', null);
        }
    }

    handleReplace() {
        if (window.monacoEditor) {
            window.monacoEditor.trigger('keyboard', 'editor.action.startFindReplaceAction', null);
        }
    }

    handleToggleComment() {
        if (window.monacoEditor) {
            window.monacoEditor.trigger('keyboard', 'editor.action.commentLine', null);
        }
    }

    handleCommandPalette() {
        if (window.menuManager) {
            const menuDropdown = document.getElementById('file-menu');
            const viewMenu = document.querySelector('.menu-item[data-menu="view"]');

            if (viewMenu) {
                const rect = viewMenu.getBoundingClientRect();
                menuDropdown.style.left = rect.left + 'px';
                menuDropdown.style.top = rect.bottom + 'px';
                menuDropdown.innerHTML = `
                    <div style="padding: 5px 10px; background: var(--input-background); border-bottom: 1px solid var(--border);">
                        <input type="text" placeholder="Type a command..." 
                               style="width: 100%; background: transparent; border: none; color: var(--input-foreground); outline: none;">
                    </div>
                    <div class="menu-dropdown-item">
                        <span>New File</span>
                        <span class="menu-shortcut">Ctrl+N</span>
                    </div>
                    <div class="menu-dropdown-item">
                        <span>Open File...</span>
                        <span class="menu-shortcut">Ctrl+O</span>
                    </div>
                    <div class="menu-dropdown-item">
                        <span>Save</span>
                        <span class="menu-shortcut">Ctrl+S</span>
                    </div>
                `;
                menuDropdown.classList.add('active');
                menuDropdown.dataset.menu = 'command-palette';

                // Focus the input
                setTimeout(() => {
                    const input = menuDropdown.querySelector('input');
                    if (input) input.focus();
                }, 0);
            }
        }
    }

    handleToggleExplorer() {
        if (window.sidebarManager) {
            if (window.sidebarManager.currentView === 'explorer' && window.sidebarManager.isSidebarVisible()) {
                window.sidebarManager.hideSidebar();
            } else {
                window.sidebarManager.showView('explorer');
            }
        }
    }

    handleToggleSearch() {
        if (window.sidebarManager) {
            if (window.sidebarManager.currentView === 'search' && window.sidebarManager.isSidebarVisible()) {
                window.sidebarManager.hideSidebar();
            } else {
                window.sidebarManager.showView('search');
            }
        }
    }

    handleToggleGit() {
        if (window.sidebarManager) {
            if (window.sidebarManager.currentView === 'git' && window.sidebarManager.isSidebarVisible()) {
                window.sidebarManager.hideSidebar();
            } else {
                window.sidebarManager.showView('git');
            }
        }
    }

    handleToggleDebug() {
        if (window.sidebarManager) {
            if (window.sidebarManager.currentView === 'debug' && window.sidebarManager.isSidebarVisible()) {
                window.sidebarManager.hideSidebar();
            } else {
                window.sidebarManager.showView('debug');
            }
        }
    }

    handleToggleExtensions() {
        if (window.sidebarManager) {
            if (window.sidebarManager.currentView === 'extensions' && window.sidebarManager.isSidebarVisible()) {
                window.sidebarManager.hideSidebar();
            } else {
                window.sidebarManager.showView('extensions');
            }
        }
    }

    handleToggleTerminal() {
        const panel = document.getElementById('bottom-panel');
        if (panel.style.display === 'none') {
            panel.style.display = 'flex';
            if (window.sidebarManager) {
                window.sidebarManager.switchPanel('terminal');
            }
        } else {
            const currentPanel = document.querySelector('.panel-tab.active').dataset.panel;
            if (currentPanel === 'terminal') {
                panel.style.display = 'none';
            } else {
                if (window.sidebarManager) {
                    window.sidebarManager.switchPanel('terminal');
                }
            }
        }
    }

    handleToggleSidebar() {
        if (window.sidebarManager) {
            const sidebar = document.querySelector('.sidebar');
            if (window.sidebarManager.isSidebarVisible()) {
                window.sidebarManager.hideSidebar();
            } else {
                window.sidebarManager.showSidebar();
            }
        }
    }

    handleGoToDefinition() {
        if (window.monacoEditor) {
            window.monacoEditor.trigger('keyboard', 'editor.action.revealDefinition', null);
        }
    }

    async handleGoToLine() {
        // We need access to fileOperations or implement our own modal
        // Simplest is to assume fileOperations is available since it has the modal now
        if (window.fileOperations) {
            const line = await window.fileOperations.showInputModal('Go to line:column', '1:1');
            if (line && window.editorManager) {
                window.editorManager.goToLine(line);
            }
        }
    }

    handleGoToImplementation() {
        console.log('Go to Implementation');
    }

    handleGoToReferences() {
        console.log('Go to References');
    }

    handleStartDebugging() {
        console.log('Start Debugging');
        if (window.statusBarManager) {
            window.statusBarManager.showNotification('Starting debug session...', 'info');
        }
    }

    handleRunWithoutDebugging() {
        console.log('Run Without Debugging');
    }

    handleStopDebugging() {
        console.log('Stop Debugging');
    }

    handleToggleBreakpoint() {
        console.log('Toggle Breakpoint');
    }

    handleStepOver() {
        console.log('Step Over');
    }

    handleStepInto() {
        console.log('Step Into');
    }

    handleStepOut() {
        console.log('Step Out');
    }

    handleNewTerminal() {
        if (window.xtermSetup) {
            window.xtermSetup.executeCommand('clear');
        }
    }

    handleSplitTerminal() {
        console.log('Split Terminal');
    }

    handleNewWindow() {
        console.log('New Window');
    }

    handleShowAllCommands() {
        this.handleCommandPalette();
    }

    handleOpenSettings() {
        console.log('Open Settings');
    }

    handleFindInFiles() {
        if (window.sidebarManager) {
            window.sidebarManager.showView('search');
        }
    }

    handleReplaceInFiles() {
        if (window.sidebarManager) {
            window.sidebarManager.showView('search');
        }
    }

    // Utility methods
    getAllShortcuts() {
        return Array.from(this.shortcuts.values());
    }

    getShortcutsByContext(context) {
        return this.getAllShortcuts().filter(s => s.context === context);
    }

    disableShortcut(keyCombo) {
        const shortcut = this.shortcuts.get(keyCombo.toLowerCase());
        if (shortcut) {
            shortcut.enabled = false;
        }
    }

    enableShortcut(keyCombo) {
        const shortcut = this.shortcuts.get(keyCombo.toLowerCase());
        if (shortcut) {
            shortcut.enabled = true;
        }
    }

    addCustomShortcut(keyCombo, description, action) {
        this.register(keyCombo, description, action, 'custom');
        this.saveCustomShortcuts();
    }

    removeCustomShortcut(keyCombo) {
        this.unregister(keyCombo);
        this.saveCustomShortcuts();
    }

    showShortcutHelp() {
        const shortcuts = this.getAllShortcuts();

        const helpWindow = window.open('', 'Shortcuts Help', 'width=600,height=800');
        helpWindow.document.write(`
            <html>
                <head>
                    <title>Keyboard Shortcuts</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                            padding: 20px;
                            background: #1e1e1e;
                            color: #cccccc;
                        }
                        h1 {
                            color: #ffffff;
                            border-bottom: 1px solid #3c3c3c;
                            padding-bottom: 10px;
                        }
                        .category {
                            margin: 20px 0;
                        }
                        .category h2 {
                            color: #569cd6;
                            font-size: 16px;
                            margin-bottom: 10px;
                        }
                        .shortcut {
                            display: flex;
                            justify-content: space-between;
                            padding: 5px 10px;
                            border-bottom: 1px solid #2a2d2e;
                        }
                        .shortcut:hover {
                            background: #2a2d2e;
                        }
                        .key {
                            background: #094771;
                            color: #ffffff;
                            padding: 2px 6px;
                            border-radius: 3px;
                            font-family: monospace;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <h1>Keyboard Shortcuts</h1>
                    ${this.generateHelpContent(shortcuts)}
                </body>
            </html>
        `);
    }

    generateHelpContent(shortcuts) {
        const categories = {
            'File': shortcuts.filter(s => s.description.includes('File') || s.description.includes('Save')),
            'Edit': shortcuts.filter(s => s.description.includes('Undo') || s.description.includes('Copy') || s.description.includes('Find')),
            'View': shortcuts.filter(s => s.description.includes('Toggle') || s.description.includes('Explorer')),
            'Navigation': shortcuts.filter(s => s.description.includes('Go to') || s.description.includes('Command')),
            'Debug': shortcuts.filter(s => s.description.includes('Debug') || s.description.includes('Step') || s.description.includes('Breakpoint')),
            'Terminal': shortcuts.filter(s => s.description.includes('Terminal')),
            'Other': shortcuts.filter(s => !Object.values(categories).flat().includes(s))
        };

        let html = '';

        for (const [category, items] of Object.entries(categories)) {
            if (items.length > 0) {
                html += `
                    <div class="category">
                        <h2>${category}</h2>
                        ${items.map(item => `
                            <div class="shortcut">
                                <span>${item.description}</span>
                                <span class="key">${item.keyCombo.toUpperCase()}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        return html;
    }
}

// Initialize keyboard shortcuts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.keyboardShortcuts = new KeyboardShortcuts();
});