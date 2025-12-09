class EditorManager {
    constructor() {
        this.editors = new Map(); // tabId -> editor model
        this.currentTabId = null;
        this.unsavedChanges = new Set();
        this.init();
    }

    init() {
        // Wait for Monaco to load
        this.waitForMonaco().then(() => {
            this.setupEventListeners();
        });
    }

    async waitForMonaco() {
        return new Promise((resolve) => {
            const checkMonaco = () => {
                if (window.monacoEditor) {
                    resolve();
                } else {
                    setTimeout(checkMonaco, 100);
                }
            };
            checkMonaco();
        });
    }

    setupEventListeners() {
        // Listen for tab changes
        document.addEventListener('tab-activated', (e) => {
            this.switchToTab(e.detail.tabId);
        });

        // Listen for editor changes
        window.monacoEditor.onDidChangeModelContent((e) => {
            this.handleEditorChange(e);
        });

        // Listen for beforeunload to warn about unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.unsavedChanges.size > 0) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    }

    openFile(filePath, content = '') {
        // Check if file is already open
        const existingTab = window.tabManager.getTabByPath(filePath);
        if (existingTab) {
            window.tabManager.activateTab(existingTab.id);
            return existingTab;
        }

        // Create new tab
        const tab = window.tabManager.createTab(filePath, content);

        // Create editor model
        this.createEditorModel(tab.id, content, filePath);

        // Update editor with content
        this.updateEditorContent(tab.id, content);

        // Set language based on file extension
        this.setEditorLanguage(tab.id, tab.language);

        return tab;
    }

    createEditorModel(tabId, content, filePath) {
        const uri = monaco.Uri.file(filePath);
        const language = window.tabManager.getLanguageFromExtension(filePath.split('.').pop());

        const model = monaco.editor.createModel(content, language, uri);
        this.editors.set(tabId, model);

        return model;
    }

    switchToTab(tabId) {
        this.currentTabId = tabId;

        const model = this.editors.get(tabId);
        if (model && window.monacoEditor) {
            window.monacoEditor.setModel(model);

            // Update status bar
            const tab = window.tabManager.getTabById(tabId);
            if (tab && window.statusBarManager) {
                window.statusBarManager.updateFileType(tab.language);
            }

            // Focus editor
            window.monacoEditor.focus();

            // Hide empty state
            this.toggleEmptyState(false);
        } else if (!model && window.monacoEditor) {
            // Clear editor if no model
            window.monacoEditor.setModel(null);
        }
    }

    updateEditorContent(tabId, content) {
        const model = this.editors.get(tabId);
        if (model) {
            model.setValue(content);
        }
    }

    toggleEmptyState(visible) {
        const emptyState = document.querySelector('.editor-empty-state');
        if (emptyState) {
            emptyState.style.display = visible ? 'flex' : 'none';
        }

        // Resize editor when visibility changes
        if (!visible && window.monacoEditor) {
            window.monacoEditor.layout();
        }
    }

    setEditorLanguage(tabId, language) {
        const model = this.editors.get(tabId);
        if (model) {
            monaco.editor.setModelLanguage(model, language);
        }
    }

    handleEditorChange(event) {
        if (!this.currentTabId) return;

        // Mark tab as dirty
        window.tabManager.markTabAsDirty(this.currentTabId);
        this.unsavedChanges.add(this.currentTabId);

        // Update tab content in tab manager
        const content = window.monacoEditor.getValue();
        window.tabManager.updateTabContent(this.currentTabId, content);
    }

    async saveCurrentFile() {
        if (!this.currentTabId) return;

        await this.saveFile(this.currentTabId);
    }

    async saveFile(tabId) {
        const tab = window.tabManager.getTabById(tabId);
        if (!tab) return;

        try {
            const content = window.monacoEditor.getValue();
            const result = await window.api.writeFile(tab.path, content);

            if (result.success) {
                // Mark as saved
                window.tabManager.markTabAsSaved(tabId);
                this.unsavedChanges.delete(tabId);

                // Show notification
                if (window.statusBarManager) {
                    window.statusBarManager.showNotification(`Saved ${tab.name}`, 'success');
                }

                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error saving file:', error);

            if (window.statusBarManager) {
                window.statusBarManager.showNotification(`Error saving ${tab.name}: ${error.message}`, 'error');
            }

            return false;
        }
    }

    async saveAllFiles() {
        const tabs = window.tabManager.getAllTabs();
        const dirtyTabs = tabs.filter(tab => tab.dirty);

        let savedCount = 0;
        for (const tab of dirtyTabs) {
            const success = await this.saveFile(tab.id);
            if (success) {
                savedCount++;
            }
        }

        if (window.statusBarManager) {
            if (savedCount === dirtyTabs.length) {
                window.statusBarManager.showNotification(`Saved ${savedCount} files`, 'success');
            } else {
                window.statusBarManager.showNotification(`Saved ${savedCount} of ${dirtyTabs.length} files`, 'warning');
            }
        }
    }

    clearEditor() {
        if (window.monacoEditor) {
            window.monacoEditor.setModel(null);
        }
        this.toggleEmptyState(true);
    }

    goToLine(lineCol) {
        if (!window.monacoEditor) return;

        const [line, col = 1] = lineCol.split(':').map(Number);

        window.monacoEditor.setPosition({ lineNumber: line, column: col });
        window.monacoEditor.revealLineInCenter(line);
        window.monacoEditor.focus();
    }

    findText(text) {
        if (!window.monacoEditor) return;

        const findAction = window.monacoEditor.getAction('actions.find');
        if (findAction) {
            findAction.run().then(() => {
                const findInput = document.querySelector('.find-widget .input');
                if (findInput) {
                    findInput.value = text;
                    findInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }
    }

    replaceText(find, replace) {
        if (!window.monacoEditor) return;

        const replaceAction = window.monacoEditor.getAction('editor.action.startFindReplaceAction');
        if (replaceAction) {
            replaceAction.run().then(() => {
                // This would need to set the find/replace inputs
                console.log('Replace:', find, 'with', replace);
            });
        }
    }

    formatDocument() {
        if (!window.monacoEditor) return;

        const formatAction = window.monacoEditor.getAction('editor.action.formatDocument');
        if (formatAction) {
            formatAction.run();
        }
    }

    commentSelection() {
        if (!window.monacoEditor) return;

        const commentAction = window.monacoEditor.getAction('editor.action.commentLine');
        if (commentAction) {
            commentAction.run();
        }
    }

    duplicateSelection() {
        if (!window.monacoEditor) return;

        const duplicateAction = window.monacoEditor.getAction('editor.action.copyLinesDownAction');
        if (duplicateAction) {
            duplicateAction.run();
        }
    }

    getCurrentContent() {
        if (!window.monacoEditor) return '';
        return window.monacoEditor.getValue();
    }

    getCurrentLanguage() {
        if (!this.currentTabId) return null;

        const tab = window.tabManager.getTabById(this.currentTabId);
        return tab ? tab.language : null;
    }

    getCurrentFilePath() {
        if (!this.currentTabId) return null;

        const tab = window.tabManager.getTabById(this.currentTabId);
        return tab ? tab.path : null;
    }

    hasUnsavedChanges() {
        return this.unsavedChanges.size > 0;
    }

    dispose() {
        // Clean up editor models
        this.editors.forEach(model => {
            model.dispose();
        });
        this.editors.clear();
    }
}

// Initialize editor manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.editorManager = new EditorManager();
});