class DragDropManager {
    constructor() {
        this.draggedItem = null;
        this.dragOverItem = null;
        this.init();
    }

    init() {
        this.setupFileExplorerDragDrop();
        this.setupEditorDragDrop();
        this.setupExternalDragDrop();
    }

    setupFileExplorerDragDrop() {
        const fileExplorer = document.getElementById('file-explorer');
        
        if (!fileExplorer) return;

        // Drag start
        fileExplorer.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.file-tree-content');
            if (item) {
                this.draggedItem = item.closest('.file-tree-item');
                e.dataTransfer.setData('text/plain', this.draggedItem.dataset.path);
                e.dataTransfer.effectAllowed = 'move';
                
                // Add visual feedback
                this.draggedItem.classList.add('dragging');
            }
        });

        // Drag end
        fileExplorer.addEventListener('dragend', (e) => {
            if (this.draggedItem) {
                this.draggedItem.classList.remove('dragging');
                this.draggedItem = null;
            }
        });

        // Drag over
        fileExplorer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const item = e.target.closest('.file-tree-content');
            if (item) {
                const treeItem = item.closest('.file-tree-item');
                if (treeItem && treeItem !== this.draggedItem) {
                    treeItem.classList.add('drag-over');
                    this.dragOverItem = treeItem;
                }
            }
        });

        // Drag leave
        fileExplorer.addEventListener('dragleave', (e) => {
            if (this.dragOverItem) {
                this.dragOverItem.classList.remove('drag-over');
                this.dragOverItem = null;
            }
        });

        // Drop
        fileExplorer.addEventListener('drop', async (e) => {
            e.preventDefault();
            
            if (this.dragOverItem) {
                this.dragOverItem.classList.remove('drag-over');
            }
            
            if (!this.draggedItem || !this.dragOverItem) return;
            
            const sourcePath = this.draggedItem.dataset.path;
            const targetPath = this.dragOverItem.dataset.path;
            const targetIsDir = this.dragOverItem.dataset.type === 'directory';
            
            if (sourcePath === targetPath) return;
            
            try {
                if (targetIsDir) {
                    // Move to directory
                    await this.moveItemToDirectory(sourcePath, targetPath);
                } else {
                    // Move to same directory (reorder)
                    await this.reorderItems(sourcePath, targetPath);
                }
                
                // Refresh file explorer
                if (window.fileExplorer) {
                    await window.fileExplorer.refresh();
                }
            } catch (error) {
                console.error('Error during drag-drop operation:', error);
                if (window.statusBarManager) {
                    window.statusBarManager.showNotification(`Error: ${error.message}`, 'error');
                }
            }
            
            this.draggedItem = null;
            this.dragOverItem = null;
        });
    }

    setupEditorDragDrop() {
        const editorTabs = document.getElementById('editor-tabs');
        const editorContainer = document.getElementById('editor-container');
        
        if (!editorTabs || !editorContainer) return;

        // Allow dropping files into editor area
        editorContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            
            // Visual feedback
            editorContainer.classList.add('drag-over');
        });

        editorContainer.addEventListener('dragleave', () => {
            editorContainer.classList.remove('drag-over');
        });

        editorContainer.addEventListener('drop', async (e) => {
            e.preventDefault();
            editorContainer.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                for (const file of files) {
                    await this.handleDroppedFile(file);
                }
            }
        });
    }

    setupExternalDragDrop() {
        // Handle external file drops (from OS file explorer)
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', async (e) => {
            e.preventDefault();
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                for (const file of files) {
                    await this.handleExternalFileDrop(file);
                }
            }
        });
    }

    async handleDroppedFile(file) {
        if (!file) return;
        
        try {
            // Read file content
            const content = await this.readFileAsText(file);
            const filePath = file.path || file.name;
            
            // Open in editor
            if (window.editorManager) {
                window.editorManager.openFile(filePath, content);
            }
            
            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Opened: ${file.name}`, 'success');
            }
        } catch (error) {
            console.error('Error reading dropped file:', error);
            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Error opening file: ${error.message}`, 'error');
            }
        }
    }

    async handleExternalFileDrop(file) {
        if (!file) return;
        
        try {
            // Check if it's a directory
            if (file.type === '' && file.size === 0 && file.path) {
                // Likely a directory
                if (window.fileExplorer) {
                    await window.fileExplorer.openFolder(file.path);
                }
            } else {
                // It's a file
                await this.handleDroppedFile(file);
            }
        } catch (error) {
            console.error('Error handling external file drop:', error);
        }
    }

    async moveItemToDirectory(sourcePath, targetDirPath) {
        if (!sourcePath || !targetDirPath) return;
        
        const sourceName = sourcePath.split('/').pop();
        const newPath = `${targetDirPath}/${sourceName}`;
        
        try {
            // In a real app, this would use fs.rename
            await window.api.renameFile(sourcePath, newPath);
            
            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Moved to ${targetDirPath.split('/').pop()}`, 'success');
            }
        } catch (error) {
            throw new Error(`Failed to move item: ${error.message}`);
        }
    }

    async reorderItems(sourcePath, targetPath) {
        // This would reorder items in the same directory
        // Implementation depends on how you want to handle reordering
        console.log('Reordering:', sourcePath, 'before', targetPath);
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            if (file instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(new Error('File read error'));
                reader.readAsText(file);
            } else if (file.path) {
                // For Electron File objects
                window.api.readFile(file.path).then(resolve).catch(reject);
            } else {
                reject(new Error('Unsupported file type'));
            }
        });
    }

    // Utility method to create drag ghost image
    createDragGhost(element, text) {
        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        ghost.textContent = text || 'Dragging...';
        
        Object.assign(ghost.style, {
            position: 'absolute',
            top: '-1000px',
            left: '-1000px',
            background: 'var(--list-activeSelectionBackground)',
            color: 'var(--list-activeSelectionForeground)',
            padding: '5px 10px',
            borderRadius: '3px',
            fontSize: '12px',
            zIndex: '10000',
            pointerEvents: 'none'
        });
        
        document.body.appendChild(ghost);
        return ghost;
    }

    // Method to enable/disable drag and drop
    setEnabled(enabled) {
        const elements = document.querySelectorAll('[draggable]');
        elements.forEach(el => {
            el.draggable = enabled;
        });
        
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            if (enabled) {
                zone.classList.remove('drop-disabled');
            } else {
                zone.classList.add('drop-disabled');
            }
        });
    }
}

// Initialize drag-drop manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dragDropManager = new DragDropManager();
});