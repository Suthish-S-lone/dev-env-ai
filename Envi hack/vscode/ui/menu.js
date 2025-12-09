class MenuManager {
    constructor() {
        this.menus = {};
        this.currentOpenMenu = null;
        this.init();
    }

    init() {
        this.createMenus();
        this.bindEvents();
    }

    createMenus() {
        this.menus = {
            file: this.createFileMenu(),
            edit: this.createEditMenu(),
            selection: this.createSelectionMenu(),
            view: this.createViewMenu(),
            go: this.createGoMenu(),
            run: this.createRunMenu(),
            terminal: this.createTerminalMenu(),
            help: this.createHelpMenu()
        };
    }

    bindEvents() {
        const menuItems = document.querySelectorAll('.menu-item');
        const menuDropdown = document.getElementById('file-menu');

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const menuType = e.currentTarget.dataset.menu;
                this.showMenu(menuType, e.currentTarget);
                e.stopPropagation();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', () => {
            this.hideMenu();
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentOpenMenu) {
                this.hideMenu();
            }
        });

        // Handle menu item clicks using event delegation
        if (menuDropdown) {
            menuDropdown.addEventListener('click', (e) => {
                const menuItem = e.target.closest('.menu-dropdown-item');
                if (menuItem && !menuItem.classList.contains('disabled')) {
                    this.handleMenuItemClick(menuItem);
                }
            });
        }
    }

    showMenu(menuType, target) {
        const menuDropdown = document.getElementById('file-menu');
        if (!menuDropdown) return;

        if (this.currentOpenMenu === menuType) {
            this.hideMenu();
            return;
        }

        this.hideMenu();
        this.currentOpenMenu = menuType;

        // Position menu
        const rect = target.getBoundingClientRect();
        menuDropdown.style.left = rect.left + 'px';
        menuDropdown.style.top = rect.bottom + 'px';

        // Set menu content
        menuDropdown.innerHTML = this.menus[menuType] || '';
        menuDropdown.classList.add('active');
        menuDropdown.dataset.menu = menuType;

        // Add CSS class for menu styling
        menuDropdown.classList.add('menu-dropdown-content');
    }

    hideMenu() {
        const menuDropdown = document.getElementById('file-menu');
        if (menuDropdown) {
            menuDropdown.classList.remove('active');
            menuDropdown.classList.remove('menu-dropdown-content');
        }
        this.currentOpenMenu = null;
    }

    handleMenuItemClick(menuItem) {
        if (!menuItem) return;

        const action = menuItem.dataset.action;
        const menuType = document.getElementById('file-menu')?.dataset.menu;

        console.log(`Menu clicked: ${menuType} -> ${action}`);

        // Handle specific actions
        this.executeMenuAction(action);

        this.hideMenu();
    }

    executeMenuAction(action) {
        switch (action) {
            case 'new-file':
                this.createNewFile();
                break;
            case 'new-window':
                // Could open new window
                console.log('New Window');
                break;
            case 'open-file':
                this.openFile();
                break;
            case 'open-folder':
                this.openFolder();
                break;
            case 'save':
                this.saveFile();
                break;
            case 'save-all':
                this.saveAllFiles();
                break;
            case 'exit':
                if (window.api && window.api.closeWindow) {
                    window.api.closeWindow();
                }
                break;
            case 'undo':
                this.handleUndo();
                break;
            case 'redo':
                this.handleRedo();
                break;
            case 'cut':
                this.handleCut();
                break;
            case 'copy':
                this.handleCopy();
                break;
            case 'paste':
                this.handlePaste();
                break;
            case 'select-all':
                this.handleSelectAll();
                break;
            case 'find':
                this.handleFind();
                break;
            case 'replace':
                this.handleReplace();
                break;
            case 'toggle-line-comment':
                this.handleToggleComment();
                break;
            case 'command-palette':
                this.handleCommandPalette();
                break;
            case 'explorer':
                this.handleToggleExplorer();
                break;
            case 'search':
                this.handleToggleSearch();
                break;
            case 'source-control':
                this.handleToggleSourceControl();
                break;
            case 'run':
                this.handleToggleRun();
                break;
            case 'extensions':
                this.handleToggleExtensions();
                break;
            case 'terminal':
                this.handleToggleTerminal();
                break;
            case 'start-debugging':
                this.handleStartDebugging();
                break;
            case 'new-terminal':
                this.handleNewTerminal();
                break;
            case 'clear':
                this.handleClearTerminal();
                break;
            case 'toggle-dev-tools':
                this.toggleDevTools();
                break;
            // Add more actions as needed
            default:
                console.log(`Action not implemented: ${action}`);
        }
    }

    // Menu Templates
    createFileMenu() {
        return `
            <div class="menu-dropdown-item" data-action="new-file">
                <span>New Text File</span>
                <span class="menu-shortcut">Ctrl+N</span>
            </div>
            <div class="menu-dropdown-item" data-action="new-file-with-profile">
                <span>New File...</span>
                <span class="menu-shortcut">Ctrl+Alt+N</span>
            </div>
            <div class="menu-dropdown-item" data-action="new-window">
                <span>New Window</span>
                <span class="menu-shortcut">Ctrl+Shift+N</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="open-file">
                <span>Open File...</span>
                <span class="menu-shortcut">Ctrl+O</span>
            </div>
            <div class="menu-dropdown-item" data-action="open-folder">
                <span>Open Folder...</span>
                <span class="menu-shortcut">Ctrl+K Ctrl+O</span>
            </div>
            <div class="menu-dropdown-item" data-action="open-recent">
                <span>Open Recent</span>
                <span class="menu-arrow">▶</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="save">
                <span>Save</span>
                <span class="menu-shortcut">Ctrl+S</span>
            </div>
            <div class="menu-dropdown-item" data-action="save-as">
                <span>Save As...</span>
                <span class="menu-shortcut">Ctrl+Shift+S</span>
            </div>
            <div class="menu-dropdown-item" data-action="save-all">
                <span>Save All</span>
                <span class="menu-shortcut">Ctrl+K S</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="auto-save">
                <span>✓ Auto Save</span>
            </div>
            <div class="menu-dropdown-item" data-action="preferences">
                <span>Preferences</span>
                <span class="menu-arrow">▶</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="close-editor">
                <span>Close Editor</span>
                <span class="menu-shortcut">Ctrl+F4</span>
            </div>
            <div class="menu-dropdown-item" data-action="close-folder">
                <span>Close Folder</span>
                <span class="menu-shortcut">Ctrl+K F</span>
            </div>
            <div class="menu-dropdown-item" data-action="close-window">
                <span>Close Window</span>
                <span class="menu-shortcut">Alt+F4</span>
            </div>
            <div class="menu-dropdown-item" data-action="exit">
                <span>Exit</span>
            </div>
        `;
    }

    createEditMenu() {
        return `
            <div class="menu-dropdown-item" data-action="undo">
                <span>Undo</span>
                <span class="menu-shortcut">Ctrl+Z</span>
            </div>
            <div class="menu-dropdown-item" data-action="redo">
                <span>Redo</span>
                <span class="menu-shortcut">Ctrl+Y</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="cut">
                <span>Cut</span>
                <span class="menu-shortcut">Ctrl+X</span>
            </div>
            <div class="menu-dropdown-item" data-action="copy">
                <span>Copy</span>
                <span class="menu-shortcut">Ctrl+C</span>
            </div>
            <div class="menu-dropdown-item" data-action="paste">
                <span>Paste</span>
                <span class="menu-shortcut">Ctrl+V</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="find">
                <span>Find</span>
                <span class="menu-shortcut">Ctrl+F</span>
            </div>
            <div class="menu-dropdown-item" data-action="replace">
                <span>Replace</span>
                <span class="menu-shortcut">Ctrl+H</span>
            </div>
            <div class="menu-dropdown-item" data-action="find-in-files">
                <span>Find in Files</span>
                <span class="menu-shortcut">Ctrl+Shift+F</span>
            </div>
            <div class="menu-dropdown-item" data-action="replace-in-files">
                <span>Replace in Files</span>
                <span class="menu-shortcut">Ctrl+Shift+H</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="toggle-line-comment">
                <span>Toggle Line Comment</span>
                <span class="menu-shortcut">Ctrl+/</span>
            </div>
            <div class="menu-dropdown-item" data-action="toggle-block-comment">
                <span>Toggle Block Comment</span>
                <span class="menu-shortcut">Shift+Alt+A</span>
            </div>
            <div class="menu-dropdown-item" data-action="emmet-expand">
                <span>Emmet: Expand Abbreviation</span>
                <span class="menu-shortcut">Tab</span>
            </div>
        `;
    }

    createSelectionMenu() {
        return `
            <div class="menu-dropdown-item" data-action="select-all">
                <span>Select All</span>
                <span class="menu-shortcut">Ctrl+A</span>
            </div>
            <div class="menu-dropdown-item" data-action="expand-selection">
                <span>Expand Selection</span>
                <span class="menu-shortcut">Shift+Alt+RightArrow</span>
            </div>
            <div class="menu-dropdown-item" data-action="shrink-selection">
                <span>Shrink Selection</span>
                <span class="menu-shortcut">Shift+Alt+LeftArrow</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="copy-line-up">
                <span>Copy Line Up</span>
                <span class="menu-shortcut">Shift+Alt+UpArrow</span>
            </div>
            <div class="menu-dropdown-item" data-action="copy-line-down">
                <span>Copy Line Down</span>
                <span class="menu-shortcut">Shift+Alt+DownArrow</span>
            </div>
            <div class="menu-dropdown-item" data-action="move-line-up">
                <span>Move Line Up</span>
                <span class="menu-shortcut">Alt+UpArrow</span>
            </div>
            <div class="menu-dropdown-item" data-action="move-line-down">
                <span>Move Line Down</span>
                <span class="menu-shortcut">Alt+DownArrow</span>
            </div>
            <div class="menu-dropdown-item" data-action="duplicate-selection">
                <span>Duplicate Selection</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="add-cursor-above">
                <span>Add Cursor Above</span>
                <span class="menu-shortcut">Ctrl+Alt+UpArrow</span>
            </div>
            <div class="menu-dropdown-item" data-action="add-cursor-below">
                <span>Add Cursor Below</span>
                <span class="menu-shortcut">Ctrl+Alt+DownArrow</span>
            </div>
            <div class="menu-dropdown-item" data-action="add-cursors-line-ends">
                <span>Add Cursors to Line Ends</span>
                <span class="menu-shortcut">Shift+Alt+I</span>
            </div>
            <div class="menu-dropdown-item" data-action="add-next-occurrence">
                <span>Add Next Occurrence</span>
                <span class="menu-shortcut">Ctrl+D</span>
            </div>
            <div class="menu-dropdown-item" data-action="select-all-occurrences">
                <span>Select All Occurrences</span>
                <span class="menu-shortcut">Ctrl+Shift+L</span>
            </div>
        `;
    }

    createViewMenu() {
        return `
            <div class="menu-dropdown-item" data-action="command-palette">
                <span>Command Palette...</span>
                <span class="menu-shortcut">Ctrl+Shift+P</span>
            </div>
            <div class="menu-dropdown-item" data-action="open-view">
                <span>Open View...</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="appearance">
                <span>Appearance</span>
                <span class="menu-arrow">▶</span>
            </div>
            <div class="menu-dropdown-item" data-action="editor-layout">
                <span>Editor Layout</span>
                <span class="menu-arrow">▶</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="explorer">
                <span>Explorer</span>
                <span class="menu-shortcut">Ctrl+Shift+E</span>
            </div>
            <div class="menu-dropdown-item" data-action="search">
                <span>Search</span>
                <span class="menu-shortcut">Ctrl+Shift+F</span>
            </div>
            <div class="menu-dropdown-item" data-action="source-control">
                <span>Source Control</span>
                <span class="menu-shortcut">Ctrl+Shift+G</span>
            </div>
            <div class="menu-dropdown-item" data-action="run">
                <span>Run</span>
                <span class="menu-shortcut">Ctrl+Shift+D</span>
            </div>
            <div class="menu-dropdown-item" data-action="extensions">
                <span>Extensions</span>
                <span class="menu-shortcut">Ctrl+Shift+X</span>
            </div>
            <div class="menu-dropdown-item" data-action="chat">
                <span>Chat</span>
                <span class="menu-shortcut">Ctrl+Alt+I</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="problems">
                <span>Problems</span>
                <span class="menu-shortcut">Ctrl+Shift+M</span>
            </div>
            <div class="menu-dropdown-item" data-action="output">
                <span>Output</span>
                <span class="menu-shortcut">Ctrl+Shift+U</span>
            </div>
            <div class="menu-dropdown-item" data-action="debug-console">
                <span>Debug Console</span>
                <span class="menu-shortcut">Ctrl+Shift+Y</span>
            </div>
            <div class="menu-dropdown-item" data-action="terminal">
                <span>Terminal</span>
                <span class="menu-shortcut">Ctrl+\`</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="word-wrap">
                <span>Word Wrap</span>
                <span class="menu-shortcut">Alt+Z</span>
            </div>
        `;
    }

    createGoMenu() {
        return `
            <div class="menu-dropdown-item" data-action="back">
                <span>Back</span>
                <span class="menu-shortcut">Alt+LeftArrow</span>
            </div>
            <div class="menu-dropdown-item" data-action="forward">
                <span>Forward</span>
                <span class="menu-shortcut">Alt+RightArrow</span>
            </div>
            <div class="menu-dropdown-item" data-action="last-edit-location">
                <span>Last Edit Location</span>
                <span class="menu-shortcut">Ctrl+K Ctrl+Q</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="switch-editor">
                <span>Switch Editor</span>
                <span class="menu-arrow">▶</span>
            </div>
            <div class="menu-dropdown-item" data-action="switch-group">
                <span>Switch Group</span>
                <span class="menu-arrow">▶</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="go-to-file">
                <span>Go to File...</span>
                <span class="menu-shortcut">Ctrl+P</span>
            </div>
            <div class="menu-dropdown-item" data-action="go-to-symbol-workspace">
                <span>Go to Symbol in Workspace...</span>
                <span class="menu-shortcut">Ctrl+T</span>
            </div>
            <div class="menu-dropdown-item" data-action="go-to-symbol-editor">
                <span>Go to Symbol in Editor...</span>
                <span class="menu-shortcut">Ctrl+Shift+O</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="go-to-definition">
                <span>Go to Definition</span>
                <span class="menu-shortcut">F12</span>
            </div>
            <div class="menu-dropdown-item" data-action="go-to-declaration">
                <span>Go to Declaration</span>
            </div>
            <div class="menu-dropdown-item" data-action="go-to-type-definition">
                <span>Go to Type Definition</span>
            </div>
            <div class="menu-dropdown-item" data-action="go-to-implementations">
                <span>Go to Implementations</span>
                <span class="menu-shortcut">Ctrl+F12</span>
            </div>
            <div class="menu-dropdown-item" data-action="go-to-references">
                <span>Go to References</span>
                <span class="menu-shortcut">Shift+F12</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="go-to-line">
                <span>Go to Line/Column...</span>
                <span class="menu-shortcut">Ctrl+G</span>
            </div>
            <div class="menu-dropdown-item" data-action="go-to-bracket">
                <span>Go to Bracket</span>
                <span class="menu-shortcut">Ctrl+Shift+\\\\</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="next-problem">
                <span>Next Problem</span>
                <span class="menu-shortcut">F8</span>
            </div>
            <div class="menu-dropdown-item" data-action="previous-problem">
                <span>Previous Problem</span>
                <span class="menu-shortcut">Shift+F8</span>
            </div>
            <div class="menu-dropdown-item" data-action="next-change">
                <span>Next Change</span>
                <span class="menu-shortcut">Alt+F3</span>
            </div>
            <div class="menu-dropdown-item" data-action="previous-change">
                <span>Previous Change</span>
                <span class="menu-shortcut">Shift+Alt+F3</span>
            </div>
        `;
    }

    createRunMenu() {
        return `
            <div class="menu-dropdown-item" data-action="start-debugging">
                <span>Start Debugging</span>
                <span class="menu-shortcut">F5</span>
            </div>
            <div class="menu-dropdown-item" data-action="run-without-debugging">
                <span>Run Without Debugging</span>
                <span class="menu-shortcut">Ctrl+F5</span>
            </div>
            <div class="menu-dropdown-item" data-action="stop-debugging">
                <span>Stop Debugging</span>
                <span class="menu-shortcut">Shift+F5</span>
            </div>
            <div class="menu-dropdown-item" data-action="restart-debugging">
                <span>Restart Debugging</span>
                <span class="menu-shortcut">Ctrl+Shift+F5</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="open-configurations">
                <span>Open Configurations</span>
            </div>
            <div class="menu-dropdown-item" data-action="add-configuration">
                <span>Add Configuration...</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="step-over">
                <span>Step Over</span>
                <span class="menu-shortcut">F10</span>
            </div>
            <div class="menu-dropdown-item" data-action="step-into">
                <span>Step Into</span>
                <span class="menu-shortcut">F11</span>
            </div>
            <div class="menu-dropdown-item" data-action="step-out">
                <span>Step Out</span>
                <span class="menu-shortcut">Shift+F11</span>
            </div>
            <div class="menu-dropdown-item" data-action="continue">
                <span>Continue</span>
                <span class="menu-shortcut">F5</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="toggle-breakpoint">
                <span>Toggle Breakpoint</span>
                <span class="menu-shortcut">F9</span>
            </div>
            <div class="menu-dropdown-item" data-action="new-breakpoint">
                <span>New Breakpoint</span>
                <span class="menu-arrow">▶</span>
            </div>
            <div class="menu-dropdown-item" data-action="enable-all-breakpoints">
                <span>Enable All Breakpoints</span>
            </div>
            <div class="menu-dropdown-item" data-action="disable-all-breakpoints">
                <span>Disable All Breakpoints</span>
            </div>
            <div class="menu-dropdown-item" data-action="remove-all-breakpoints">
                <span>Remove All Breakpoints</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="install-additional-debuggers">
                <span>Install Additional Debuggers...</span>
            </div>
        `;
    }

    createTerminalMenu() {
        return `
            <div class="menu-dropdown-item" data-action="new-terminal">
                <span>New Terminal</span>
                <span class="menu-shortcut">Ctrl+Shift+\`</span>
            </div>
            <div class="menu-dropdown-item" data-action="split-terminal">
                <span>Split Terminal</span>
                <span class="menu-shortcut">Ctrl+Shift+5</span>
            </div>
            <div class="menu-dropdown-item" data-action="new-terminal-window">
                <span>New Terminal Window</span>
                <span class="menu-shortcut">Ctrl+Shift+Alt+\`</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="run-task">
                <span>Run Task...</span>
            </div>
            <div class="menu-dropdown-item" data-action="run-build-task">
                <span>Run Build Task...</span>
                <span class="menu-shortcut">Ctrl+Shift+B</span>
            </div>
            <div class="menu-dropdown-item" data-action="run-active-file">
                <span>Run Active File</span>
            </div>
            <div class="menu-dropdown-item" data-action="run-selected-text">
                <span>Run Selected Text</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="show-running-tasks">
                <span>Show Running Tasks...</span>
            </div>
            <div class="menu-dropdown-item" data-action="restart-running-task">
                <span>Restart Running Task...</span>
            </div>
            <div class="menu-dropdown-item" data-action="terminate-task">
                <span>Terminate Task...</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="configure-tasks">
                <span>Configure Tasks...</span>
            </div>
            <div class="menu-dropdown-item" data-action="configure-default-build-task">
                <span>Configure Default Build Task...</span>
            </div>
        `;
    }

    createHelpMenu() {
        return `
            <div class="menu-dropdown-item" data-action="welcome">
                <span>Welcome</span>
                <span class="menu-shortcut">Ctrl+Shift+P</span>
            </div>
            <div class="menu-dropdown-item" data-action="show-all-commands">
                <span>Show All Commands</span>
            </div>
            <div class="menu-dropdown-item" data-action="documentation">
                <span>Documentation</span>
            </div>
            <div class="menu-dropdown-item" data-action="editor-playground">
                <span>Editor Playground</span>
            </div>
            <div class="menu-dropdown-item" data-action="open-walkthrough">
                <span>Open Walkthrough...</span>
            </div>
            <div class="menu-dropdown-item" data-action="show-release-notes">
                <span>Show Release Notes</span>
            </div>
            <div class="menu-dropdown-item" data-action="get-started-accessibility">
                <span>Get Started with Accessibility Features</span>
            </div>
            <div class="menu-dropdown-item" data-action="ask-vscode">
                <span>Ask @vscode</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="keyboard-shortcuts">
                <span>Keyboard Shortcuts Reference</span>
                <span class="menu-shortcut">Ctrl+K Ctrl+R</span>
            </div>
            <div class="menu-dropdown-item" data-action="video-tutorials">
                <span>Video Tutorials</span>
            </div>
            <div class="menu-dropdown-item" data-action="tips-tricks">
                <span>Tips and Tricks</span>
            </div>
            <div class="menu-dropdown-item" data-action="join-youtube">
                <span>Join Us on YouTube</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="search-feature-requests">
                <span>Search Feature Requests</span>
            </div>
            <div class="menu-dropdown-item" data-action="report-issue">
                <span>Report Issue</span>
            </div>
            <div class="menu-dropdown-item" data-action="view-license">
                <span>View License</span>
            </div>
            <div class="menu-dropdown-item" data-action="privacy-statement">
                <span>Privacy Statement</span>
            </div>
            <div class="menu-dropdown-separator"></div>
            <div class="menu-dropdown-item" data-action="toggle-dev-tools">
                <span>Toggle Developer Tools</span>
            </div>
            <div class="menu-dropdown-item" data-action="open-process-explorer">
                <span>Open Process Explorer</span>
            </div>
            <div class="menu-dropdown-item" data-action="check-updates">
                <span>Check for Updates...</span>
            </div>
            <div class="menu-dropdown-item" data-action="about">
                <span>About</span>
            </div>
        `;
    }

    // Action handlers
    async createNewFile() {
        const name = prompt('Enter file name:', 'newfile.txt');
        if (name) {
            if (window.fileOperations) {
                await window.fileOperations.createNewFile(name);
            } else {
                console.log('File operations not available');
                // Create a simple tab
                if (window.tabManager) {
                    window.tabManager.createTab(name, '');
                }
            }
        }
    }

    async openFile() {
        try {
            const paths = await window.api?.openFileDialog();
            if (paths && paths.length > 0) {
                if (window.fileOperations) {
                    await window.fileOperations.openFile(paths[0]);
                } else {
                    console.log('Opening file:', paths[0]);
                }
            }
        } catch (error) {
            console.error('Error opening file:', error);
        }
    }

    async openFolder() {
        try {
            const paths = await window.api?.openFolderDialog();
            if (paths && paths.length > 0) {
                if (window.fileExplorer) {
                    await window.fileExplorer.openFolder(paths[0]);
                } else {
                    console.log('Opening folder:', paths[0]);
                }
            }
        } catch (error) {
            console.error('Error opening folder:', error);
        }
    }

    saveFile() {
        if (window.editorManager) {
            window.editorManager.saveCurrentFile();
        }
    }

    saveAllFiles() {
        if (window.editorManager) {
            window.editorManager.saveAllFiles();
        }
    }

    // Editor actions
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

    // View actions
    handleCommandPalette() {
        if (window.commandPalette) {
            window.commandPalette.toggle();
        }
    }

    handleToggleExplorer() {
        if (window.sidebarManager) {
            window.sidebarManager.switchView('explorer');
        }
    }

    handleToggleSearch() {
        if (window.sidebarManager) {
            window.sidebarManager.switchView('search');
        }
    }

    handleToggleSourceControl() {
        if (window.sidebarManager) {
            window.sidebarManager.switchView('git');
        }
    }

    handleToggleRun() {
        if (window.sidebarManager) {
            window.sidebarManager.switchView('debug');
        }
    }

    handleToggleExtensions() {
        if (window.sidebarManager) {
            window.sidebarManager.switchView('extensions');
        }
    }

    handleToggleTerminal() {
        const panel = document.getElementById('bottom-panel');
        if (panel) {
            if (panel.style.display === 'none') {
                panel.style.display = 'flex';
                if (window.sidebarManager) {
                    window.sidebarManager.switchPanel('terminal');
                }
            } else {
                const currentPanel = document.querySelector('.panel-tab.active');
                if (currentPanel && currentPanel.dataset.panel === 'terminal') {
                    panel.style.display = 'none';
                } else {
                    if (window.sidebarManager) {
                        window.sidebarManager.switchPanel('terminal');
                    }
                }
            }
        }
    }

    // Run actions
    handleStartDebugging() {
        console.log('Start Debugging');
        if (window.statusBarManager) {
            window.statusBarManager.showNotification('Starting debug session...', 'info');
        }
    }

    // Terminal actions
    handleNewTerminal() {
        if (window.xtermSetup) {
            window.xtermSetup.executeCommand('clear');
        }
    }

    handleClearTerminal() {
        if (window.xtermSetup) {
            window.xtermSetup.clear();
        }
    }

    // Help actions
    toggleDevTools() {
        if (window.api && window.api.toggleDevTools) {
            window.api.toggleDevTools();
        } else {
            console.log('DevTools toggle not available');
        }
    }
}

// Initialize menu manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other components to load
    setTimeout(() => {
        window.menuManager = new MenuManager();
        console.log('Menu Manager initialized');
    }, 100);
});