class FileExplorer {
    constructor() {
        this.currentPath = null;
        this.fileTree = null;
        this.selectedItem = null;
        this.openFiles = [];
        this.activeFile = null;
        this.rootName = 'ENVI HACK';
        this.init();
    }

    init() {
        this.renderExplorerPanel();
        this.bindEvents();
        this.createContextMenu();
        this.loadInitialFiles();
    }

    renderExplorerPanel() {
        const explorerPanel = document.getElementById('explorer-panel');
        if (!explorerPanel) return;

        explorerPanel.innerHTML = `
            <div class="panel-title">
                <span>EXPLORER</span>
                <span style="float: right; font-size: 11px; color: #999999; font-weight: normal;">Ctrl+Shift+E</span>
                <div class="explorer-actions">
                    <button class="explorer-btn" title="New File" id="new-file-btn">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <path fill="currentColor" d="M13.5 7H9V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5V7H2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5H7v4.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V9h4.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"/>
                        </svg>
                    </button>
                    <button class="explorer-btn" title="New Folder" id="new-folder-btn">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <path fill="currentColor" d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.5 9h-11V4h4.29l.85.85.36.15H14v7z"/>
                        </svg>
                    </button>
                    <button class="explorer-btn" title="Refresh" id="refresh-explorer-btn">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <path fill="currentColor" d="M12.9 3.1C11.5 1.7 9.6 1 7.5 1 3.4 1 0 4.4 0 8.5S3.4 16 7.5 16c3.1 0 5.7-2 6.6-4.8l-1.5-.6c-.7 2-2.7 3.4-5.1 3.4-3 0-5.5-2.5-5.5-5.5S4.5 3 7.5 3c1.6 0 3 .7 4 1.8L9 7h6V1l-2.1 2.1z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="panel-content">
                <div style="padding: 10px 15px; font-size: 12px; color: #999999; border-bottom: 1px solid #3e3e42;">
                    OPEN EDITORS
                </div>
                <div id="open-editors-list" style="min-height: 50px;">
                    <!-- Open files will be listed here -->
                </div>
                
                <div style="padding: 10px 15px; font-size: 12px; color: #999999; border-bottom: 1px solid #3e3e42; margin-top: 10px;">
                    ${this.rootName}
                </div>
                <div id="file-explorer" class="file-explorer-container" style="padding: 5px 0;">
                    <!-- File tree will be rendered here -->
                </div>
            </div>
        `;
    }

    bindEvents() {
        // New file button
        const newFileBtn = document.getElementById('new-file-btn');
        if (newFileBtn) {
            newFileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.createNewFile();
            });
        }

        // New folder button
        const newFolderBtn = document.getElementById('new-folder-btn');
        if (newFolderBtn) {
            newFolderBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.createNewFolder();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-explorer-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.refresh();
            });
        }

        // Click outside to hide context menu
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu') && !e.target.closest('.file-tree-content')) {
                this.hideContextMenu();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'n' && !e.shiftKey) {
                e.preventDefault();
                this.createNewFile();
            } else if (e.ctrlKey && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.createNewFolder();
            } else if (e.key === 'F5') {
                e.preventDefault();
                this.refresh();
            } else if (e.key === 'F2' && this.selectedItem) {
                e.preventDefault();
                this.renameSelectedItem();
            } else if (e.key === 'Delete' && this.selectedItem) {
                e.preventDefault();
                this.deleteSelectedItem();
            }
        });
    }

    createContextMenu() {
        // Remove existing context menu if any
        const existingMenu = document.getElementById('explorer-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const contextMenu = document.createElement('div');
        contextMenu.id = 'explorer-context-menu';
        contextMenu.className = 'context-menu';
        contextMenu.style.display = 'none';
        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="new-file">
                <span>New File</span>
                <span class="context-menu-shortcut">Ctrl+N</span>
            </div>
            <div class="context-menu-item" data-action="new-folder">
                <span>New Folder</span>
                <span class="context-menu-shortcut">Ctrl+Shift+N</span>
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="rename">
                <span>Rename</span>
                <span class="context-menu-shortcut">F2</span>
            </div>
            <div class="context-menu-item" data-action="delete">
                <span>Delete</span>
                <span class="context-menu-shortcut">Delete</span>
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="copy">
                <span>Copy</span>
                <span class="context-menu-shortcut">Ctrl+C</span>
            </div>
            <div class="context-menu-item" data-action="paste">
                <span>Paste</span>
                <span class="context-menu-shortcut">Ctrl+V</span>
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="reveal-in-explorer">
                <span>Reveal in File Explorer</span>
            </div>
            <div class="context-menu-item" data-action="copy-path">
                <span>Copy Path</span>
            </div>
            <div class="context-menu-item" data-action="copy-relative-path">
                <span>Copy Relative Path</span>
            </div>
        `;

        document.body.appendChild(contextMenu);

        // Handle context menu clicks
        contextMenu.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.context-menu-item');
            if (menuItem) {
                const action = menuItem.dataset.action;
                this.handleContextMenuAction(action);
                contextMenu.style.display = 'none';
            }
        });
    }

    showContextMenu(x, y, targetItem = null) {
        const contextMenu = document.getElementById('explorer-context-menu');
        if (!contextMenu) return;

        if (targetItem) {
            this.selectedItem = targetItem;
        }

        // Position the menu
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.style.display = 'block';

        // Adjust if menu goes off screen
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = (x - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = (y - rect.height) + 'px';
        }
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('explorer-context-menu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
    }

    async handleContextMenuAction(action) {
        if (!this.selectedItem) return;

        const path = this.selectedItem.dataset.path;
        const isDirectory = this.selectedItem.dataset.type === 'directory';

        switch (action) {
            case 'new-file':
                await this.createNewFileInFolder(path);
                break;
            case 'new-folder':
                await this.createNewFolderInFolder(path);
                break;
            case 'rename':
                await this.renameSelectedItem();
                break;
            case 'delete':
                await this.deleteSelectedItem();
                break;
            case 'copy':
                await this.copyItem(path);
                break;
            case 'paste':
                await this.pasteItem(path);
                break;
            case 'reveal-in-explorer':
                await this.revealInExplorer(path);
                break;
            case 'copy-path':
                await this.copyPath(path);
                break;
            case 'copy-relative-path':
                await this.copyRelativePath(path);
                break;
        }
    }

    loadInitialFiles() {
        // Create initial file structure
        this.fileTree = []; // Empty explorer
        this.renderFileTree();
        this.updateOpenEditors();
    }

    async openFolder(folderPath) {
        this.currentPath = folderPath;
        this.rootName = folderPath.split(/[\\/]/).pop();
        this.fileTree = []; // Clear current tree

        // Update title
        this.renderExplorerPanel();

        // Show loading indicator in explorer (optional, but good UX)
        const fileExplorer = document.getElementById('file-explorer');
        if (fileExplorer) {
            fileExplorer.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Loading...</div>';
        }

        // Build file tree
        await this.buildFileTree(folderPath);

        this.renderFileTree();
    }

    async buildFileTree(path) {
        this.fileTree = await this.readDirectory(path);
    }

    async readDirectory(path) {
        try {
            const items = await window.api.readDirectory(path);
            const treeItems = [];

            for (const item of items) {
                const treeItem = {
                    name: item.name,
                    path: item.path,
                    type: item.isDirectory ? 'folder' : 'file'
                };

                if (item.isDirectory) {
                    // Recursively load children
                    treeItem.children = await this.readDirectory(item.path);
                }
                treeItems.push(treeItem);
            }

            // Sort: folders first, then files
            return treeItems.sort((a, b) => {
                if (a.type === a.type) { // Typo fix in logic intention: both are same type
                    // actually if (a.type === b.type)
                }
                // Correct logic:
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            });
        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
    }

    renderFileTree() {
        const fileExplorer = document.getElementById('file-explorer');
        if (!fileExplorer) return;

        fileExplorer.innerHTML = '';

        if (!this.fileTree || this.fileTree.length === 0) {
            fileExplorer.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No files</div>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'file-tree';
        ul.style.padding = '0';
        ul.style.margin = '0';

        this.fileTree.forEach(item => {
            const li = this.createTreeItem(item);
            ul.appendChild(li);
        });

        fileExplorer.appendChild(ul);
    }

    async readDirectory(path) {
        try {
            const items = await window.api.readDirectory(path);
            const treeItems = [];

            for (const item of items) {
                const treeItem = {
                    name: item.name,
                    path: item.path,
                    type: item.isDirectory ? 'folder' : 'file',
                    children: item.isDirectory ? [] : null // Initialize empty children for folders
                };
                treeItems.push(treeItem);
            }

            // Sort: folders first, then files
            return treeItems.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            });
        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
    }

    createTreeItem(item, level = 0) {
        const li = document.createElement('li');
        li.className = 'file-tree-item';
        li.dataset.path = item.path;
        li.dataset.type = item.type;
        li.dataset.name = item.name;
        li.dataset.level = level; // Store level for children

        const content = document.createElement('div');
        content.className = 'file-tree-content';
        content.style.paddingLeft = (level * 16) + 'px';
        content.style.padding = '3px 10px';
        content.style.paddingLeft = ((level * 16) + 10) + 'px'; // Combine padding
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.cursor = 'pointer';
        content.style.borderRadius = '3px';

        // Toggle button for folders
        if (item.type === 'folder') {
            const toggle = document.createElement('div');
            toggle.className = 'file-tree-toggle';
            toggle.innerHTML = '<i class="fas fa-chevron-right" style="font-size: 10px; width: 16px;"></i>';
            toggle.style.display = 'flex';
            toggle.style.alignItems = 'center';
            toggle.style.justifyContent = 'center';
            toggle.style.width = '16px';
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDirectory(li);
            });
            content.appendChild(toggle);
        } else {
            const spacer = document.createElement('div');
            spacer.className = 'file-tree-toggle';
            spacer.style.width = '16px';
            spacer.style.flexShrink = '0';
            content.appendChild(spacer);
        }

        // Icon
        const icon = document.createElement('div');
        icon.className = `file-tree-icon ${item.type}`;
        icon.style.marginRight = '6px';
        icon.style.width = '16px';
        icon.style.height = '16px';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';

        // Set appropriate icon
        if (item.type === 'folder') {
            icon.innerHTML = '<i class="far fa-folder" style="color: #90caf9;"></i>';
        } else {
            const ext = item.name.split('.').pop().toLowerCase();
            let iconClass = 'far fa-file';
            let color = '#cccccc';

            if (['html', 'htm'].includes(ext)) {
                iconClass = 'fab fa-html5';
                color = '#e34c26';
            } else if (['css'].includes(ext)) {
                iconClass = 'fab fa-css3-alt';
                color = '#264de4';
            } else if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
                iconClass = 'fab fa-js';
                color = '#f7df1e';
            } else if (['json'].includes(ext)) {
                iconClass = 'fas fa-code';
                color = '#fbc02d';
            } else if (['md'].includes(ext)) {
                iconClass = 'fab fa-markdown';
                color = '#083fa1';
            } else if (['py'].includes(ext)) {
                iconClass = 'fab fa-python';
                color = '#306998';
            } else if (['java'].includes(ext)) {
                iconClass = 'fab fa-java';
                color = '#007396';
            }

            icon.innerHTML = `<i class="${iconClass}" style="color: ${color};"></i>`;
        }

        content.appendChild(icon);

        // Name
        const name = document.createElement('div');
        name.className = 'file-tree-name';
        name.textContent = item.name;
        name.style.flex = '1';
        name.style.whiteSpace = 'nowrap';
        name.style.overflow = 'hidden';
        name.style.textOverflow = 'ellipsis';
        name.style.fontSize = '13px';
        name.style.color = '#cccccc';
        content.appendChild(name);

        // Click handler
        content.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectItem(li);

            if (item.type === 'file') {
                this.openFile(item);
            }
        });

        // Double click handler
        content.addEventListener('dblclick', () => {
            if (item.type === 'folder') {
                this.toggleDirectory(li);
            } else {
                this.openFile(item);
            }
        });

        // Context menu handler
        content.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.selectItem(li);
            this.showContextMenu(e.clientX, e.clientY, li);
        });

        li.appendChild(content);

        // Children container for folders
        if (item.type === 'folder') {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'file-tree-children';
            childrenContainer.style.display = 'none';
            // childrenContainer.style.paddingLeft = '16px'; // Handled by level logic now

            // If we have children (pre-loaded), render them. 
            // With lazy loading, this will be empty appropriately.
            if (item.children && item.children.length > 0) {
                item.children.forEach(child => {
                    const childItem = this.createTreeItem(child, level + 1);
                    childrenContainer.appendChild(childItem);
                });
            } else {
                // Mark as not loaded
                li.dataset.loaded = 'false';
            }

            li.appendChild(childrenContainer);
        }

        return li;
    }

    selectItem(item) {
        // Remove selection from all items
        document.querySelectorAll('.file-tree-content').forEach(content => {
            content.classList.remove('selected');
            content.style.backgroundColor = 'transparent';
        });

        // Add selection to clicked item
        const content = item.querySelector('.file-tree-content');
        if (content) {
            content.classList.add('selected');
            content.style.backgroundColor = '#094771';
            this.selectedItem = item;
        }
    }

    async toggleDirectory(item) {
        const childrenContainer = item.querySelector('.file-tree-children');
        const toggleIcon = item.querySelector('.file-tree-toggle i');
        const path = item.dataset.path;

        if (!childrenContainer || !toggleIcon) return;

        // Check if expanded
        if (item.classList.contains('expanded')) {
            // Collapse
            item.classList.remove('expanded');
            toggleIcon.className = 'fas fa-chevron-right';
            childrenContainer.style.display = 'none';
        } else {
            // Expand
            item.classList.add('expanded');
            toggleIcon.className = 'fas fa-chevron-down';
            childrenContainer.style.display = 'block';

            // Check if loaded
            if (item.dataset.loaded === 'false') {
                item.dataset.loaded = 'true'; // Mark as loading/loaded

                // Show temporary loading state
                childrenContainer.innerHTML = '<div style="padding-left: 20px; color: #666; font-size: 11px;">Loading...</div>';

                // Load children
                const children = await this.readDirectory(path);

                childrenContainer.innerHTML = ''; // Clear loading

                if (children.length === 0) {
                    childrenContainer.innerHTML = '<div style="padding-left: 20px; color: #666; font-size: 11px;">(Empty)</div>';
                } else {
                    // Get current level from parent dataset
                    const parentLevel = parseInt(item.dataset.level || 0);

                    children.forEach(child => {
                        const childItem = this.createTreeItem(child, parentLevel + 1);
                        childrenContainer.appendChild(childItem);
                    });
                }

                // Update internal model (optional but good for consistency)
                const treeItemModel = this.findItemByPath(path);
                if (treeItemModel) {
                    treeItemModel.children = children;
                }
            }
        }
    }

    async openFile(file) {
        // Check if file is already open
        const existingFile = this.openFiles.find(f => f.path === file.path);

        // If content is missing, try to read it
        if (!file.content && window.api) {
            try {
                // Show loading state if needed, or just wait
                const content = await window.api.readFile(file.path);
                if (content !== null) {
                    file.content = content;
                }
            } catch (error) {
                console.error('Error reading file:', error);
            }
        }

        if (!existingFile) {
            this.openFiles.push(file);
            this.updateOpenEditors();
        }

        this.activeFile = file;

        // Dispatch event for editor to open the file
        const event = new CustomEvent('file-open', {
            detail: {
                name: file.name,
                path: file.path,
                content: file.content || '',
                type: file.type
            }
        });
        document.dispatchEvent(event);

        // Update active file indicator
        this.updateActiveFileIndicator(file);
    }

    updateOpenEditors() {
        const openEditorsList = document.getElementById('open-editors-list');
        if (!openEditorsList) return;

        openEditorsList.innerHTML = '';

        this.openFiles.forEach((file, index) => {
            const editorItem = document.createElement('div');
            editorItem.className = 'panel-item open-editor-item';
            editorItem.dataset.path = file.path;
            editorItem.style.display = 'flex';
            editorItem.style.alignItems = 'center';
            editorItem.style.padding = '5px 15px';
            editorItem.style.cursor = 'pointer';
            editorItem.style.borderRadius = '3px';

            if (this.activeFile && file.path === this.activeFile.path) {
                editorItem.style.backgroundColor = '#094771';
            }

            // Close button
            const closeBtn = document.createElement('i');
            closeBtn.className = 'fas fa-times';
            closeBtn.style.marginRight = '8px';
            closeBtn.style.fontSize = '10px';
            closeBtn.style.color = '#cccccc';
            closeBtn.style.cursor = 'pointer';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeFile(file);
            });

            // File icon
            const icon = document.createElement('i');
            icon.className = file.type === 'folder' ? 'far fa-folder' : 'far fa-file';
            icon.style.marginRight = '8px';
            icon.style.fontSize = '12px';
            icon.style.color = '#cccccc';

            // File name
            const name = document.createElement('span');
            name.textContent = file.name;
            name.style.fontSize = '13px';
            name.style.color = '#cccccc';

            editorItem.appendChild(closeBtn);
            editorItem.appendChild(icon);
            editorItem.appendChild(name);

            editorItem.addEventListener('click', () => {
                this.openFile(file);
            });

            openEditorsList.appendChild(editorItem);
        });
    }

    updateActiveFileIndicator(file) {
        // Update open editors list
        document.querySelectorAll('.open-editor-item').forEach(item => {
            item.style.backgroundColor = item.dataset.path === file.path ? '#094771' : 'transparent';
        });

        // Update file tree selection
        document.querySelectorAll('.file-tree-content').forEach(content => {
            content.style.backgroundColor = 'transparent';
        });

        const treeItem = document.querySelector(`.file-tree-item[data-path="${file.path}"] .file-tree-content`);
        if (treeItem) {
            treeItem.style.backgroundColor = '#094771';
        }
    }

    closeFile(file) {
        const index = this.openFiles.findIndex(f => f.path === file.path);
        if (index > -1) {
            this.openFiles.splice(index, 1);

            // If we're closing the active file, set another file as active
            if (this.activeFile && file.path === this.activeFile.path) {
                this.activeFile = this.openFiles.length > 0 ? this.openFiles[0] : null;

                if (this.activeFile) {
                    // Open the new active file
                    const event = new CustomEvent('file-open', {
                        detail: {
                            name: this.activeFile.name,
                            path: this.activeFile.path,
                            content: this.activeFile.content || '',
                            type: this.activeFile.type
                        }
                    });
                    document.dispatchEvent(event);
                } else {
                    // No files open, clear editor
                    const event = new CustomEvent('editor-clear');
                    document.dispatchEvent(event);
                }
            }

            this.updateOpenEditors();
        }
    }

    showInputModal(title, defaultValue = '') {
        return new Promise((resolve) => {
            const modal = document.getElementById('input-modal');
            const modalTitle = document.getElementById('modal-title');
            const input = document.getElementById('modal-input');
            const okBtn = document.getElementById('modal-ok');
            const cancelBtn = document.getElementById('modal-cancel');

            if (!modal) {
                resolve(null);
                return;
            }

            modalTitle.textContent = title;
            input.value = defaultValue;
            modal.style.display = 'flex';
            input.focus();
            input.select();

            const cleanup = () => {
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
                input.removeEventListener('keydown', handleKeydown);
                modal.style.display = 'none';
            };

            const handleOk = () => {
                const value = input.value.trim();
                cleanup();
                resolve(value);
            };

            const handleCancel = () => {
                cleanup();
                resolve(null);
            };

            const handleKeydown = (e) => {
                if (e.key === 'Enter') {
                    handleOk();
                } else if (e.key === 'Escape') {
                    handleCancel();
                }
            };

            okBtn.addEventListener('click', handleOk);
            cancelBtn.addEventListener('click', handleCancel);
            input.addEventListener('keydown', handleKeydown);
        });
    }

    async createNewFile() {
        const fileName = await this.showInputModal('Enter file name (with extension):', 'newfile.js');
        if (!fileName) return;

        // Validate file name
        if (!fileName.includes('.')) {
            alert('Please include a file extension (e.g., .js, .html, .css)');
            return;
        }

        let targetPath = '';

        if (this.selectedItem && this.selectedItem.dataset.type === 'folder') {
            targetPath = this.selectedItem.dataset.path;
        } else if (this.selectedItem) {
            // A file is selected, create in its parent folder
            const parentPath = this.selectedItem.dataset.path.substring(0, this.selectedItem.dataset.path.lastIndexOf(this.selectedItem.dataset.name.includes('\\') ? '\\' : '/'));
            await window.fileOperations.createNewFile(fileName, '', parentPath);
            return;
        }

        // If no specific item selected, default to current path
        if (!targetPath && this.currentPath) {
            targetPath = this.currentPath;
        }

        if (!targetPath) {
            alert("No folder open. Please open a folder first.");
            return;
        }

        // Call file operations
        await window.fileOperations.createNewFile(fileName, '', targetPath);
    }

    async createNewFolder() {
        const folderName = await this.showInputModal('Enter folder name:', 'newfolder');
        if (!folderName) return;

        const newFolder = {
            name: folderName,
            type: 'folder',
            path: `/${folderName}`,
            children: []
        };

        this.fileTree.push(newFolder);
        this.renderFileTree();
    }

    async createNewFileInFolder(folderPath) {
        const fileName = await this.showInputModal('Enter file name (with extension):', 'newfile.js');
        if (!fileName) return;

        // Find the folder
        const folder = this.findItemByPath(folderPath);
        if (!folder || folder.type !== 'folder') {
            alert('Selected item is not a folder');
            return;
        }

        if (!folder.children) {
            folder.children = [];
        }

        const newFile = {
            name: fileName,
            type: 'file',
            path: `${folderPath}/${fileName}`,
            content: this.getDefaultContent(fileName)
        };

        folder.children.push(newFile);
        this.renderFileTree();

        // Expand the folder
        const folderElement = document.querySelector(`.file-tree-item[data-path="${folderPath}"]`);
        if (folderElement && !folderElement.classList.contains('expanded')) {
            this.toggleDirectory(folderElement);
        }
    }

    async createNewFolderInFolder(folderPath) {
        const folderName = await this.showInputModal('Enter folder name:', 'newfolder');
        if (!folderName) return;

        // Find the folder
        const folder = this.findItemByPath(folderPath);
        if (!folder || folder.type !== 'folder') {
            alert('Selected item is not a folder');
            return;
        }

        if (!folder.children) {
            folder.children = [];
        }

        const newFolder = {
            name: folderName,
            type: 'folder',
            path: `${folderPath}/${folderName}`,
            children: []
        };

        folder.children.push(newFolder);
        this.renderFileTree();

        // Expand the folder
        const folderElement = document.querySelector(`.file-tree-item[data-path="${folderPath}"]`);
        if (folderElement && !folderElement.classList.contains('expanded')) {
            this.toggleDirectory(folderElement);
        }
    }

    async renameSelectedItem() {
        if (!this.selectedItem) {
            alert('No item selected');
            return;
        }

        const oldPath = this.selectedItem.dataset.path;
        const oldName = this.selectedItem.dataset.name;
        const itemType = this.selectedItem.dataset.type;

        const newName = await this.showInputModal(`Rename ${itemType}:`, oldName);
        if (!newName || newName === oldName) return;

        // Update in file tree
        const item = this.findItemByPath(oldPath);
        if (item) {
            const oldNamePart = oldName;
            const newPath = oldPath.replace(oldNamePart, newName);

            item.name = newName;
            item.path = newPath;

            // Update children paths if it's a folder
            if (item.type === 'folder' && item.children) {
                this.updateChildrenPaths(item, newPath);
            }
        }

        // Update open files
        this.openFiles.forEach(file => {
            if (file.path.startsWith(oldPath + '/') || file.path === oldPath) {
                file.path = file.path.replace(oldPath, newPath);
                if (file.path === oldPath) {
                    file.name = newName;
                }
            }
        });

        this.renderFileTree();
        this.updateOpenEditors();
    }

    async deleteSelectedItem() {
        if (!this.selectedItem) {
            alert('No item selected');
            return;
        }

        const path = this.selectedItem.dataset.path;
        const name = this.selectedItem.dataset.name;
        const itemType = this.selectedItem.dataset.type;

        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        // Remove from file tree
        this.removeItemByPath(path);

        // Remove from open files
        this.openFiles = this.openFiles.filter(file => !file.path.startsWith(path + '/') && file.path !== path);

        // If active file was deleted, set another active file
        if (this.activeFile && (this.activeFile.path === path || this.activeFile.path.startsWith(path + '/'))) {
            this.activeFile = this.openFiles.length > 0 ? this.openFiles[0] : null;

            if (this.activeFile) {
                const event = new CustomEvent('file-open', {
                    detail: {
                        name: this.activeFile.name,
                        path: this.activeFile.path,
                        content: this.activeFile.content || '',
                        type: this.activeFile.type
                    }
                });
                document.dispatchEvent(event);
            }
        }

        this.renderFileTree();
        this.updateOpenEditors();
    }

    getDefaultContent(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();

        switch (ext) {
            case 'html':
                return '<!DOCTYPE html>\n<html>\n<head>\n    <title>New Document</title>\n</head>\n<body>\n    \n</body>\n</html>';
            case 'css':
                return '/* Stylesheet */\n\nbody {\n    margin: 0;\n    padding: 0;\n}';
            case 'js':
                return '// JavaScript file\n\nconsole.log("Hello, world!");';
            case 'json':
                return '{\n    "name": "newfile",\n    "version": "1.0.0"\n}';
            case 'md':
                return '# New Document\n\nStart writing here...';
            case 'py':
                return '# Python script\n\nprint("Hello, world!")';
            default:
                return '';
        }
    }

    findItemByPath(path) {
        // Recursive search
        const search = (items) => {
            for (const item of items) {
                if (item.path === path) return item;
                if (item.children) {
                    const found = search(item.children);
                    if (found) return found;
                }
            }
            return null;
        };

        return search(this.fileTree);
    }

    removeItemByPath(path) {
        // Recursive remove
        const remove = (items) => {
            const index = items.findIndex(item => item.path === path);
            if (index > -1) {
                items.splice(index, 1);
                return true;
            }

            for (const item of items) {
                if (item.children) {
                    if (remove(item.children)) return true;
                }
            }
            return false;
        };

        remove(this.fileTree);
    }

    updateChildrenPaths(folder, newFolderPath) {
        if (!folder.children) return;

        folder.children.forEach(child => {
            const oldPath = child.path;
            const childName = child.name;
            const newPath = `${newFolderPath}/${childName}`;

            child.path = newPath;

            if (child.type === 'folder') {
                this.updateChildrenPaths(child, newPath);
            }
        });
    }
}

// Initialize explorer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // FileExplorer is initialized by Sidebar
});