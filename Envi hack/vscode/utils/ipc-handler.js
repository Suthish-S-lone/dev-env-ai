class IPCHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setupIPCListeners();
        this.setupErrorHandling();
    }

    setupIPCListeners() {
        // Listen for messages from main process
        // Note: In a real app, you would use window.api.on() for events
        // For this demo, we'll set up handlers for specific scenarios
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.sendErrorToMain(event.error);
        });

        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.sendErrorToMain(event.reason);
        });
    }

    sendErrorToMain(error) {
        // In a real app, you would send this to main process for logging
        console.error('Application error:', error);
        
        // Show error in status bar
        if (window.statusBarManager) {
            window.statusBarManager.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    // File operations
    async readFile(path) {
        try {
            return await window.api.readFile(path);
        } catch (error) {
            console.error('IPC Error reading file:', error);
            throw error;
        }
    }

    async writeFile(path, content) {
        try {
            return await window.api.writeFile(path, content);
        } catch (error) {
            console.error('IPC Error writing file:', error);
            throw error;
        }
    }

    async createFile(path) {
        try {
            return await window.api.createFile(path);
        } catch (error) {
            console.error('IPC Error creating file:', error);
            throw error;
        }
    }

    async createFolder(path) {
        try {
            return await window.api.createFolder(path);
        } catch (error) {
            console.error('IPC Error creating folder:', error);
            throw error;
        }
    }

    async deleteFile(path) {
        try {
            return await window.api.deleteFile(path);
        } catch (error) {
            console.error('IPC Error deleting file:', error);
            throw error;
        }
    }

    async renameFile(oldPath, newPath) {
        try {
            return await window.api.renameFile(oldPath, newPath);
        } catch (error) {
            console.error('IPC Error renaming file:', error);
            throw error;
        }
    }

    async readDirectory(path) {
        try {
            return await window.api.readDirectory(path);
        } catch (error) {
            console.error('IPC Error reading directory:', error);
            throw error;
        }
    }

    // Dialog operations
    async openFileDialog() {
        try {
            return await window.api.openFileDialog();
        } catch (error) {
            console.error('IPC Error opening file dialog:', error);
            throw error;
        }
    }

    async openFolderDialog() {
        try {
            return await window.api.openFolderDialog();
        } catch (error) {
            console.error('IPC Error opening folder dialog:', error);
            throw error;
        }
    }

    async saveFileDialog(defaultPath) {
        try {
            return await window.api.saveFileDialog(defaultPath);
        } catch (error) {
            console.error('IPC Error opening save dialog:', error);
            throw error;
        }
    }

    // Window operations
    minimizeWindow() {
        try {
            window.api.minimizeWindow();
        } catch (error) {
            console.error('IPC Error minimizing window:', error);
        }
    }

    maximizeWindow() {
        try {
            window.api.maximizeWindow();
        } catch (error) {
            console.error('IPC Error maximizing window:', error);
        }
    }

    closeWindow() {
        try {
            window.api.closeWindow();
        } catch (error) {
            console.error('IPC Error closing window:', error);
        }
    }

    // Utility methods
    async getFileInfo(path) {
        try {
            // This would be a custom IPC call to get file stats
            // For now, we'll simulate it
            const content = await this.readFile(path);
            return {
                path: path,
                size: content.length,
                lines: content.split('\n').length,
                modified: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting file info:', error);
            throw error;
        }
    }

    async getDirectoryTree(path, depth = 3) {
        try {
            const items = await this.readDirectory(path);
            const tree = [];
            
            for (const item of items) {
                const node = {
                    name: item.name,
                    path: item.path,
                    type: item.isDirectory ? 'directory' : 'file',
                    children: []
                };
                
                if (item.isDirectory && depth > 0) {
                    try {
                        node.children = await this.getDirectoryTree(item.path, depth - 1);
                    } catch (error) {
                        // Skip if we can't read subdirectory
                        console.warn(`Cannot read directory: ${item.path}`);
                    }
                }
                
                tree.push(node);
            }
            
            return tree;
        } catch (error) {
            console.error('Error getting directory tree:', error);
            throw error;
        }
    }

    async batchFileOperations(operations) {
        const results = [];
        
        for (const op of operations) {
            try {
                let result;
                switch (op.type) {
                    case 'createFile':
                        result = await this.createFile(op.path);
                        break;
                    case 'createFolder':
                        result = await this.createFolder(op.path);
                        break;
                    case 'delete':
                        result = await this.deleteFile(op.path);
                        break;
                    case 'rename':
                        result = await this.renameFile(op.oldPath, op.newPath);
                        break;
                    default:
                        throw new Error(`Unknown operation type: ${op.type}`);
                }
                
                results.push({ success: true, operation: op, result });
            } catch (error) {
                results.push({ success: false, operation: op, error: error.message });
            }
        }
        
        return results;
    }

    // Event emitters (for communication to main process)
    emit(event, data) {
        // In a real app, you would use window.api.send()
        console.log(`Event emitted: ${event}`, data);
        
        // Simulate event handling
        switch (event) {
            case 'file-saved':
                // Update UI or trigger actions
                break;
            case 'file-opened':
                // Update recent files list
                break;
            case 'workspace-changed':
                // Update workspace state
                break;
        }
    }

    // Progress tracking for long operations
    async withProgress(operation, title = 'Processing...') {
        if (window.statusBarManager) {
            window.statusBarManager.setBusy(true);
        }
        
        try {
            const result = await operation();
            return result;
        } finally {
            if (window.statusBarManager) {
                window.statusBarManager.setBusy(false);
            }
        }
    }

    // Check if path exists
    async pathExists(path) {
        try {
            await this.readDirectory(path);
            return true;
        } catch (error) {
            try {
                await this.readFile(path);
                return true;
            } catch (readError) {
                return false;
            }
        }
    }

    // Copy file (simulated - would need proper implementation in main process)
    async copyFile(source, destination) {
        try {
            const content = await this.readFile(source);
            return await this.writeFile(destination, content);
        } catch (error) {
            console.error('Error copying file:', error);
            throw error;
        }
    }
}

// Initialize IPC handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ipcHandler = new IPCHandler();
});