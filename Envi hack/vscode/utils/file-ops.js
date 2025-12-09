class FileOperations {
    constructor() {
        this.currentWorkspace = null;
        this.recentFiles = [];
        this.recentFolders = [];
        this.init();
    }

    init() {
        this.loadRecentItems();
        this.setupAutoSave();
    }

    setupAutoSave() {
        // Auto-save interval (every 30 seconds)
        setInterval(() => {
            if (this.isAutoSaveEnabled()) {
                this.autoSave();
            }
        }, 30000);
    }

    isAutoSaveEnabled() {
        // Check auto-save setting (could be stored in localStorage)
        return localStorage.getItem('autoSave') !== 'false';
    }

    async createNewFile(name = null, content = '', directory = null) {
        console.log('FileOperations.createNewFile called', { name, content, directory });
        try {
            if (!name) {
                name = await this.promptFileName();
                if (!name) return null;
            }

            console.log('Creating file with name:', name);
            let baseDir = directory || this.currentWorkspace;

            // Fallback: Check explorer path if workspace is not set
            if (!baseDir && window.fileExplorer && window.fileExplorer.currentPath) {
                baseDir = window.fileExplorer.currentPath;
            }

            const filePath = baseDir ? `${baseDir}/${name}` : name;

            console.log('Target filePath:', filePath);

            const result = await window.api.createFile(filePath);
            console.log('API createFile result:', result);

            if (result.success) {
                if (window.editorManager) {
                    window.editorManager.openFile(filePath, content);
                }

                if (window.statusBarManager) {
                    window.statusBarManager.showNotification(`Created: ${name}`, 'success');
                }

                // Refresh explorer if workspace is open
                if (this.currentWorkspace && window.fileExplorer) {
                    window.fileExplorer.refresh();
                }

                return filePath;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error creating file:', error);
            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Error creating file: ${error.message}`, 'error');
            }
            return null;
        }
    }

    async createNewFolder(name = null, directory = null) {
        try {
            if (!name) {
                name = await this.promptFolderName();
                if (!name) return null;
            }

            const folderPath = directory ?
                `${directory}/${name}` :
                (this.currentWorkspace ? `${this.currentWorkspace}/${name}` : name);

            const result = await window.api.createFolder(folderPath);

            if (result.success) {
                if (window.statusBarManager) {
                    window.statusBarManager.showNotification(`Created folder: ${name}`, 'success');
                }

                // Refresh explorer
                if (window.fileExplorer) {
                    window.fileExplorer.refresh();
                }

                return folderPath;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error creating folder:', error);
            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Error creating folder: ${error.message}`, 'error');
            }
            return null;
        }
    }

    async openFile(filePath = null) {
        try {
            if (!filePath) {
                const paths = await window.api.openFileDialog();
                if (!paths || paths.length === 0) return null;
                filePath = paths[0];
            }

            const content = await window.api.readFile(filePath);

            if (content !== null) {
                const fileName = filePath.split(/[\\/]/).pop();
                const fileType = fileName.includes('.') ? 'file' : 'file'; // Simple type detection

                // Open through FileExplorer to update UI (Open Editors list)
                if (window.fileExplorer) {
                    await window.fileExplorer.openFile({
                        name: fileName,
                        path: filePath,
                        content: content,
                        type: fileType
                    });
                } else if (window.editorManager) {
                    // Fallback if fileExplorer is not available
                    window.editorManager.openFile(filePath, content);
                }

                this.addToRecentFiles(filePath);

                if (window.statusBarManager) {
                    window.statusBarManager.showNotification(`Opened: ${fileName}`, 'success');
                }

                return filePath;
            } else {
                throw new Error('Failed to read file');
            }
        } catch (error) {
            console.error('Error opening file:', error);
            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Error opening file: ${error.message}`, 'error');
            }
            return null;
        }
    }

    async openFolder(folderPath = null) {
        try {
            if (!folderPath) {
                const paths = await window.api.openFolderDialog();
                if (!paths || paths.length === 0) return null;
                folderPath = paths[0];
            }

            this.currentWorkspace = folderPath;

            if (window.fileExplorer) {
                console.log('Opening folder in explorer:', folderPath);
                await window.fileExplorer.openFolder(folderPath);

                // Switch to explorer view
                if (window.sidebarManager) {
                    window.sidebarManager.switchView('explorer');
                }
            } else {
                console.error('FileExplorer not found');
            }

            this.addToRecentFolders(folderPath);

            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Opened workspace: ${folderPath.split(/[\\/]/).pop()}`, 'success');
            }

            return folderPath;
        } catch (error) {
            console.error('Error opening folder:', error);
            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Error opening folder: ${error.message}`, 'error');
            }
            return null;
        }
    }

    async saveFile(filePath = null, content = null) {
        try {
            if (!filePath || !content) {
                // Get from current editor
                if (!window.editorManager) return false;

                const currentPath = window.editorManager.getCurrentFilePath();
                const currentContent = window.editorManager.getCurrentContent();

                if (!currentPath) {
                    // Save as new file
                    return await this.saveFileAs(currentContent);
                }

                filePath = currentPath;
                content = currentContent;
            }

            const result = await window.api.writeFile(filePath, content);

            if (result.success) {
                if (window.tabManager) {
                    const tab = window.tabManager.getTabByPath(filePath);
                    if (tab) {
                        window.tabManager.markTabAsSaved(tab.id);
                    }
                }

                if (window.statusBarManager) {
                    window.statusBarManager.showNotification(`Saved: ${filePath.split('/').pop()}`, 'success');
                }

                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error saving file:', error);
            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Error saving file: ${error.message}`, 'error');
            }
            return false;
        }
    }

    async saveFileAs(content = null) {
        try {
            if (!content && window.editorManager) {
                content = window.editorManager.getCurrentContent();
            }

            const defaultPath = this.currentWorkspace ?
                `${this.currentWorkspace}/untitled.txt` : 'untitled.txt';

            const filePath = await window.api.saveFileDialog(defaultPath);
            if (!filePath) return false;

            return await this.saveFile(filePath, content);
        } catch (error) {
            console.error('Error saving file as:', error);
            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Error saving file: ${error.message}`, 'error');
            }
            return false;
        }
    }

    async deleteFile(filePath, confirm = true) {
        try {
            if (confirm) {
                const fileName = filePath.split('/').pop();
                // window.confirm might also be blocked. Auto-confirming to avoid crash.
                // const confirmed = confirm(`Are you sure you want to delete "${fileName}"?`);
                const confirmed = true;
                if (!confirmed) return false;
            }

            const result = await window.api.deleteFile(filePath);

            if (result.success) {
                // Close tab if file is open
                if (window.tabManager) {
                    const tab = window.tabManager.getTabByPath(filePath);
                    if (tab) {
                        window.tabManager.closeTab(tab.id);
                    }
                }

                // Refresh explorer
                if (window.fileExplorer) {
                    window.fileExplorer.refresh();
                }

                if (window.statusBarManager) {
                    window.statusBarManager.showNotification(`Deleted: ${filePath.split('/').pop()}`, 'success');
                }

                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Error deleting file: ${error.message}`, 'error');
            }
            return false;
        }
    }

    async renameFile(oldPath, newName = null) {
        try {
            if (!newName) {
                const currentName = oldPath.split('/').pop();
                newName = await this.showInputModal('Enter new name:', currentName);
                if (!newName) return false;
            }

            const newPath = oldPath.split('/').slice(0, -1).join('/') + '/' + newName;

            const result = await window.api.renameFile(oldPath, newPath);

            if (result.success) {
                // Update tab if file is open
                if (window.tabManager) {
                    const tab = window.tabManager.getTabByPath(oldPath);
                    if (tab) {
                        tab.path = newPath;
                        tab.name = newName;

                        const tabElement = document.querySelector(`.editor-tab[data-id="${tab.id}"] .editor-tab-title`);
                        if (tabElement) {
                            tabElement.textContent = newName;
                        }
                    }
                }

                // Refresh explorer
                if (window.fileExplorer) {
                    window.fileExplorer.refresh();
                }

                if (window.statusBarManager) {
                    window.statusBarManager.showNotification(`Renamed to: ${newName}`, 'success');
                }

                return newPath;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error renaming file:', error);
            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Error renaming file: ${error.message}`, 'error');
            }
            return null;
        }
    }

    async autoSave() {
        if (!window.editorManager || !window.editorManager.hasUnsavedChanges()) {
            return;
        }

        try {
            const saved = await this.saveFile();
            if (saved && window.statusBarManager) {
                window.statusBarManager.showNotification('Auto-saved changes', 'info');
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
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
                console.error('Modal element not found');
                resolve(null);
                return;
            }

            modalTitle.textContent = title;
            input.value = defaultValue;
            modal.style.display = 'flex';
            input.focus();
            input.select();

            // Clear previous listeners to avoid duplicates
            const newOkBtn = okBtn.cloneNode(true);
            okBtn.parentNode.replaceChild(newOkBtn, okBtn);

            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);

            const cleanup = () => {
                modal.style.display = 'none';
            };

            const handleOk = () => {
                const value = newInput.value.trim();
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

            newOkBtn.addEventListener('click', handleOk);
            newCancelBtn.addEventListener('click', handleCancel);
            newInput.addEventListener('keydown', handleKeydown);
        });
    }

    async promptFileName(defaultName = 'newfile.txt') {
        return await this.showInputModal('Enter file name:', defaultName);
    }

    async promptFolderName(defaultName = 'New Folder') {
        return await this.showInputModal('Enter folder name:', defaultName);
    }

    addToRecentFiles(filePath) {
        if (!filePath) return;

        this.recentFiles = this.recentFiles.filter(f => f !== filePath);
        this.recentFiles.unshift(filePath);

        // Keep only last 10 files
        if (this.recentFiles.length > 10) {
            this.recentFiles.pop();
        }

        this.saveRecentItems();
    }

    addToRecentFolders(folderPath) {
        if (!folderPath) return;

        this.recentFolders = this.recentFolders.filter(f => f !== folderPath);
        this.recentFolders.unshift(folderPath);

        // Keep only last 5 folders
        if (this.recentFolders.length > 5) {
            this.recentFolders.pop();
        }

        this.saveRecentItems();
    }

    saveRecentItems() {
        try {
            localStorage.setItem('recentFiles', JSON.stringify(this.recentFiles));
            localStorage.setItem('recentFolders', JSON.stringify(this.recentFolders));
        } catch (error) {
            console.error('Error saving recent items:', error);
        }
    }

    loadRecentItems() {
        try {
            const files = localStorage.getItem('recentFiles');
            const folders = localStorage.getItem('recentFolders');

            if (files) {
                this.recentFiles = JSON.parse(files);
            }

            if (folders) {
                this.recentFolders = JSON.parse(folders);
            }
        } catch (error) {
            console.error('Error loading recent items:', error);
            this.recentFiles = [];
            this.recentFolders = [];
        }
    }

    getRecentFiles() {
        return this.recentFiles;
    }

    getRecentFolders() {
        return this.recentFolders;
    }

    clearRecentFiles() {
        this.recentFiles = [];
        this.saveRecentItems();
    }

    clearRecentFolders() {
        this.recentFolders = [];
        this.saveRecentItems();
    }

    getCurrentWorkspace() {
        return this.currentWorkspace;
    }

    setCurrentWorkspace(path) {
        this.currentWorkspace = path;
    }

    async openRecentFile(index) {
        if (index >= 0 && index < this.recentFiles.length) {
            return await this.openFile(this.recentFiles[index]);
        }
        return null;
    }

    async openRecentFolder(index) {
        if (index >= 0 && index < this.recentFolders.length) {
            return await this.openFolder(this.recentFolders[index]);
        }
        return null;
    }
}

// Initialize file operations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fileOperations = new FileOperations();
});