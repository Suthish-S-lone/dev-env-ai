class Sidebar {
    constructor() {
        this.activePanel = 'explorer';
        this.init();
    }

    init() {
        this.bindEvents();
        this.showPanel('explorer');

        // Initialize the FileExplorer when sidebar is ready
        this.initializeExplorer();
    }

    bindEvents() {
        // Get all sidebar buttons
        const explorerBtn = document.getElementById('explorer-btn');
        const searchBtn = document.getElementById('search-btn');
        const sourceControlBtn = document.getElementById('source-control-btn');
        const runDebugBtn = document.getElementById('run-debug-btn');
        const extensionsBtn = document.getElementById('extensions-btn');

        // Bind click events to each button
        if (explorerBtn) {
            explorerBtn.addEventListener('click', () => {
                this.showPanel('explorer');
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.showPanel('search');
            });
        }

        if (sourceControlBtn) {
            sourceControlBtn.addEventListener('click', () => {
                this.showPanel('source-control');
            });
        }

        if (runDebugBtn) {
            runDebugBtn.addEventListener('click', () => {
                this.showPanel('run-debug');
            });
        }

        if (extensionsBtn) {
            extensionsBtn.addEventListener('click', () => {
                this.showPanel('extensions');
            });
        }

        // Handle sidebar toggle button if it exists
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Handle Accounts and Settings
        const accountsBtn = document.querySelector('[data-view="accounts"]');
        if (accountsBtn) {
            accountsBtn.addEventListener('click', () => {
                alert('Accounts clicked');
            });
        }

        const settingsBtn = document.querySelector('[data-view="settings"]');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                alert('Settings clicked');
            });
        }
    }

    showPanel(panelName) {
        // Update active panel
        this.activePanel = panelName;

        // Hide all panels
        const panels = document.querySelectorAll('.sidebar-panel');
        panels.forEach(panel => {
            panel.classList.remove('active');
            panel.style.display = 'none';
        });

        // Show selected panel
        const activePanel = document.getElementById(`${panelName}-panel`);
        if (activePanel) {
            activePanel.classList.add('active');
            activePanel.style.display = 'block';
        }

        // Update active button in activity bar
        this.updateActiveButton(panelName);

        // Initialize the panel if needed
        this.initializePanel(panelName);
    }

    updateActiveButton(panelName) {
        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.activity-bar-item');
        buttons.forEach(button => {
            button.classList.remove('active');
        });

        // Add active class to clicked button
        const activeButton = document.getElementById(`${panelName}-btn`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    initializePanel(panelName) {
        switch (panelName) {
            case 'explorer':
                this.initializeExplorer();
                break;
            case 'search':
                this.initializeSearch();
                break;
            case 'source-control':
                this.initializeSourceControl();
                break;
            case 'run-debug':
                this.initializeRunDebug();
                break;
            case 'extensions':
                this.initializeExtensions();
                break;
        }
    }

    initializeExplorer() {
        // Initialize FileExplorer if it hasn't been initialized yet
        if (!window.fileExplorer) {
            // Check if FileExplorer class exists
            if (typeof FileExplorer !== 'undefined') {
                window.fileExplorer = new FileExplorer();
            } else {
                console.warn('FileExplorer class not found. Make sure explorer.js is loaded.');
            }
        }
    }

    initializeSearch() {
        // Initialize search functionality
        const searchPanel = document.getElementById('search-panel');
        if (searchPanel && !searchPanel.querySelector('.search-input')) {
            searchPanel.innerHTML = `
                <div class="panel-title">
                    <span>SEARCH</span>
                </div>
                <div class="panel-content">
                    <div style="padding: 10px;">
                        <input type="text" class="search-input" placeholder="Search files..." 
                               style="width: 100%; padding: 5px; background: #3c3c3c; border: 1px solid #007acc; color: #fff;">
                    </div>
                    <div id="search-results" style="padding: 10px; color: #999;">
                        Search results will appear here
                    </div>
                </div>
            `;
        }
    }

    initializeSourceControl() {
        // Initialize source control functionality
        const sourceControlPanel = document.getElementById('source-control-panel');
        if (sourceControlPanel && !sourceControlPanel.querySelector('.source-control-content')) {
            sourceControlPanel.innerHTML = `
                <div class="panel-title">
                    <span>SOURCE CONTROL</span>
                </div>
                <div class="panel-content">
                    <div style="padding: 10px;">
                        <div style="margin-bottom: 10px;">
                            <button id="initialize-repo-btn" style="width: 100%; padding: 8px; background: #007acc; color: white; border: none; cursor: pointer;">
                                Initialize Repository
                            </button>
                        </div>
                        <div id="git-status" style="color: #999; padding: 10px; border-top: 1px solid #3e3e42;">
                            No repository found
                        </div>
                    </div>
                </div>
            `;

            // Bind git button events
            const initRepoBtn = document.getElementById('initialize-repo-btn');
            if (initRepoBtn) {
                initRepoBtn.addEventListener('click', () => {
                    alert('Git repository initialization would happen here');
                });
            }
        }
    }

    initializeRunDebug() {
        // Initialize run and debug functionality
        const runDebugPanel = document.getElementById('run-debug-panel');
        if (runDebugPanel && !runDebugPanel.querySelector('.run-debug-content')) {
            runDebugPanel.innerHTML = `
                <div class="panel-title">
                    <span>RUN AND DEBUG</span>
                </div>
                <div class="panel-content">
                    <div style="padding: 10px;">
                        <div style="margin-bottom: 10px;">
                            <button id="run-debug-start-btn" style="width: 100%; padding: 8px; background: #007acc; color: white; border: none; cursor: pointer;">
                                <i class="fas fa-play" style="margin-right: 5px;"></i> Start Debugging
                            </button>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <button id="run-without-debug-btn" style="width: 100%; padding: 8px; background: #3c3c3c; color: white; border: 1px solid #007acc; cursor: pointer;">
                                Run Without Debugging
                            </button>
                        </div>
                        <div id="debug-configuration" style="color: #999; padding: 10px; border-top: 1px solid #3e3e42;">
                            No debug configuration found
                        </div>
                    </div>
                </div>
            `;

            // Bind debug button events
            const runDebugBtn = document.getElementById('run-debug-start-btn');
            if (runDebugBtn) {
                runDebugBtn.addEventListener('click', () => {
                    alert('Debug session would start here');
                });
            }

            const runWithoutDebugBtn = document.getElementById('run-without-debug-btn');
            if (runWithoutDebugBtn) {
                runWithoutDebugBtn.addEventListener('click', () => {
                    alert('Running without debugging');
                });
            }
        }
    }

    initializeExtensions() {
        // Initialize extensions functionality
        const extensionsPanel = document.getElementById('extensions-panel');
        if (extensionsPanel && !extensionsPanel.querySelector('.extensions-content')) {
            extensionsPanel.innerHTML = `
                <div class="panel-title">
                    <span>EXTENSIONS</span>
                </div>
                <div class="panel-content">
                    <div style="padding: 10px;">
                        <input type="text" class="extensions-search" placeholder="Search Extensions in Marketplace" 
                               style="width: 100%; padding: 5px; background: #3c3c3c; border: 1px solid #007acc; color: #fff; margin-bottom: 10px;">
                        <div id="extensions-list" style="color: #999; padding: 10px;">
                            <div style="margin-bottom: 10px; padding: 10px; background: #2d2d30; border-radius: 3px;">
                                <strong>JavaScript (ES6) code snippets</strong><br>
                                <small>Rich JavaScript language support</small>
                            </div>
                            <div style="margin-bottom: 10px; padding: 10px; background: #2d2d30; border-radius: 3px;">
                                <strong>Python</strong><br>
                                <small>Python language support</small>
                            </div>
                            <div style="margin-bottom: 10px; padding: 10px; background: #2d2d30; border-radius: 3px;">
                                <strong>HTML CSS Support</strong><br>
                                <small>HTML/CSS language support</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');

            // Update toggle button icon
            const toggleBtn = document.getElementById('sidebar-toggle');
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    if (sidebar.classList.contains('collapsed')) {
                        icon.className = 'fas fa-chevron-right';
                    } else {
                        icon.className = 'fas fa-chevron-left';
                    }
                }
            }
        }
    }

    hideSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.add('collapsed');
        }
    }

    showSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('collapsed');
        }
    }

    isSidebarVisible() {
        const sidebar = document.querySelector('.sidebar');
        return sidebar && !sidebar.classList.contains('collapsed');
    }

    getActivePanel() {
        return this.activePanel;
    }
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sidebar = new Sidebar();
});