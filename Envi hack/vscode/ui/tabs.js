class TabManager {
    constructor() {
        this.tabs = [];
        this.activeTab = null;
        this.tabCounter = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDragAndDrop();
    }

    bindEvents() {
        // Close button clicks are handled via event delegation in renderer.js
    }

    setupDragAndDrop() {
        const tabsContainer = document.getElementById('editor-tabs');
        
        tabsContainer.addEventListener('dragstart', (e) => {
            if (e.target.closest('.editor-tab')) {
                const tab = e.target.closest('.editor-tab');
                e.dataTransfer.setData('text/plain', tab.dataset.id);
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        tabsContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        tabsContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const tabId = e.dataTransfer.getData('text/plain');
            const draggedTab = document.querySelector(`.editor-tab[data-id="${tabId}"]`);
            
            if (draggedTab) {
                const afterElement = this.getDragAfterElement(tabsContainer, e.clientX);
                
                if (afterElement) {
                    tabsContainer.insertBefore(draggedTab, afterElement);
                } else {
                    tabsContainer.appendChild(draggedTab);
                }
                
                // Update tabs array order
                this.updateTabsOrder();
            }
        });
    }

    getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.editor-tab:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateTabsOrder() {
        const tabsContainer = document.getElementById('editor-tabs');
        const tabElements = [...tabsContainer.querySelectorAll('.editor-tab')];
        
        // Reorder tabs array based on DOM order
        const newTabsOrder = tabElements.map(tabEl => {
            return this.tabs.find(tab => tab.id === tabEl.dataset.id);
        }).filter(tab => tab);
        
        this.tabs = newTabsOrder;
    }

    createTab(filePath, content = '') {
        const fileName = filePath.split('/').pop();
        const fileExtension = fileName.split('.').pop().toLowerCase();
        
        const tab = {
            id: `tab-${this.tabCounter++}`,
            path: filePath,
            name: fileName,
            content: content,
            dirty: false,
            saved: true,
            language: this.getLanguageFromExtension(fileExtension)
        };
        
        this.tabs.push(tab);
        this.renderTab(tab);
        this.activateTab(tab.id);
        
        return tab;
    }

    getLanguageFromExtension(extension) {
        const languageMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'scss': 'scss',
            'less': 'less',
            'json': 'json',
            'md': 'markdown',
            'py': 'python',
            'java': 'java',
            'php': 'php',
            'xml': 'xml',
            'yml': 'yaml',
            'yaml': 'yaml',
            'sql': 'sql',
            'sh': 'shell',
            'bash': 'shell',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'go': 'go',
            'rb': 'ruby',
            'rs': 'rust'
        };
        
        return languageMap[extension] || 'plaintext';
    }

    renderTab(tab) {
        const tabsContainer = document.getElementById('editor-tabs');
        const placeholder = tabsContainer.querySelector('.tab-placeholder');
        
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        const tabElement = document.createElement('div');
        tabElement.className = 'editor-tab';
        tabElement.dataset.id = tab.id;
        tabElement.draggable = true;
        
        const iconClass = this.getIconClass(tab.language);
        
        tabElement.innerHTML = `
            <div class="editor-tab-content">
                <div class="editor-tab-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="editor-tab-title">${tab.name}</div>
                <div class="editor-tab-close" data-action="close-tab">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        `;
        
        // Add dirty indicator
        if (tab.dirty) {
            tabElement.classList.add('dirty');
        }
        
        tabElement.addEventListener('click', (e) => {
            if (!e.target.closest('.editor-tab-close')) {
                this.activateTab(tab.id);
            }
        });
        
        tabsContainer.appendChild(tabElement);
    }

    getIconClass(language) {
        const iconMap = {
            'javascript': 'fab fa-js',
            'typescript': 'fas fa-code',
            'html': 'fab fa-html5',
            'css': 'fab fa-css3-alt',
            'python': 'fab fa-python',
            'java': 'fab fa-java',
            'php': 'fab fa-php',
            'json': 'fas fa-code',
            'markdown': 'fab fa-markdown',
            'xml': 'fas fa-code',
            'yaml': 'fas fa-code',
            'sql': 'fas fa-database',
            'shell': 'fas fa-terminal',
            'cpp': 'fas fa-code',
            'c': 'fas fa-code',
            'csharp': 'fas fa-code',
            'go': 'fas fa-code',
            'ruby': 'fas fa-gem',
            'rust': 'fas fa-code'
        };
        
        return iconMap[language] || 'fas fa-file';
    }

    activateTab(tabId) {
        // Update UI
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.id === tabId) {
                tab.classList.add('active');
            }
        });
        
        // Update active tab reference
        this.activeTab = this.tabs.find(tab => tab.id === tabId);
        
        // Notify editor manager
        if (window.editorManager) {
            window.editorManager.switchToTab(tabId);
        }
        
        // Update status bar
        this.updateStatusBar();
    }

    closeTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        // Check if tab has unsaved changes
        if (tab.dirty) {
            if (!confirm(`Do you want to save changes to "${tab.name}"?`)) {
                // User chose not to save
                this.removeTab(tabId);
                return;
            }
            
            // Save changes
            if (window.editorManager) {
                window.editorManager.saveFile(tabId);
            }
        }
        
        this.removeTab(tabId);
    }

    removeTab(tabId) {
        // Remove from DOM
        const tabElement = document.querySelector(`.editor-tab[data-id="${tabId}"]`);
        if (tabElement) {
            tabElement.remove();
        }
        
        // Remove from array
        const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex !== -1) {
            this.tabs.splice(tabIndex, 1);
        }
        
        // If this was the active tab, activate another one
        if (this.activeTab && this.activeTab.id === tabId) {
            if (this.tabs.length > 0) {
                // Activate next tab, or previous if this was the last
                const newIndex = Math.min(tabIndex, this.tabs.length - 1);
                if (newIndex >= 0) {
                    this.activateTab(this.tabs[newIndex].id);
                }
            } else {
                // No tabs left
                this.activeTab = null;
                this.showPlaceholder();
                
                // Clear editor
                if (window.editorManager) {
                    window.editorManager.clearEditor();
                }
            }
        }
    }

    showPlaceholder() {
        const tabsContainer = document.getElementById('editor-tabs');
        const placeholder = tabsContainer.querySelector('.tab-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
        }
    }

    updateTabContent(tabId, content) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (tab) {
            tab.content = content;
            
            // Mark as dirty if content changed from saved version
            // This would require tracking original content
            const tabElement = document.querySelector(`.editor-tab[data-id="${tabId}"]`);
            if (tabElement && !tab.saved) {
                tabElement.classList.add('dirty');
                tab.dirty = true;
            }
        }
    }

    markTabAsSaved(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (tab) {
            tab.dirty = false;
            tab.saved = true;
            
            const tabElement = document.querySelector(`.editor-tab[data-id="${tabId}"]`);
            if (tabElement) {
                tabElement.classList.remove('dirty');
            }
        }
    }

    markTabAsDirty(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (tab) {
            tab.dirty = true;
            tab.saved = false;
            
            const tabElement = document.querySelector(`.editor-tab[data-id="${tabId}"]`);
            if (tabElement) {
                tabElement.classList.add('dirty');
            }
        }
    }

    updateStatusBar() {
        if (!this.activeTab) return;
        
        // Update line and column (this would come from editor)
        const lineCol = document.getElementById('line-col');
        if (lineCol) {
            lineCol.textContent = 'Ln 1, Col 1'; // Would be updated by editor
        }
        
        // Update file type
        const fileType = document.getElementById('file-type');
        if (fileType) {
            fileType.textContent = this.activeTab.language.charAt(0).toUpperCase() + 
                                  this.activeTab.language.slice(1);
        }
    }

    getActiveTab() {
        return this.activeTab;
    }

    getTabById(tabId) {
        return this.tabs.find(tab => tab.id === tabId);
    }

    getTabByPath(path) {
        return this.tabs.find(tab => tab.path === path);
    }

    getAllTabs() {
        return this.tabs;
    }

    closeAllTabs() {
        this.tabs.forEach(tab => {
            this.closeTab(tab.id);
        });
    }

    saveAllTabs() {
        if (window.editorManager) {
            window.editorManager.saveAllFiles();
        }
    }
}

// Initialize tab manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tabManager = new TabManager();
});