class StatusBarManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateClock();
        this.setupNotifications();
    }

    bindEvents() {
        // Status bar items can have click handlers
        const statusbarItems = document.querySelectorAll('.statusbar-item');
        statusbarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const itemId = e.currentTarget.id;
                this.handleStatusBarItemClick(itemId);
            });
        });
    }

    updateClock() {
        // Update time every minute
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Find or create time element
            let timeElement = document.getElementById('current-time');
            if (!timeElement) {
                timeElement = document.createElement('span');
                timeElement.id = 'current-time';
                timeElement.className = 'statusbar-item';
                document.querySelector('.statusbar-right').appendChild(timeElement);
            }
            
            timeElement.textContent = timeString;
            timeElement.title = 'Current Time';
        }, 60000);
        
        // Initial update
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let timeElement = document.getElementById('current-time');
        if (!timeElement) {
            timeElement = document.createElement('span');
            timeElement.id = 'current-time';
            timeElement.className = 'statusbar-item';
            document.querySelector('.statusbar-right').appendChild(timeElement);
        }
        
        timeElement.textContent = timeString;
        timeElement.title = 'Current Time';
    }

    setupNotifications() {
        // Initialize error and warning counts
        this.updateErrorCount(0);
        this.updateWarningCount(0);
    }

    handleStatusBarItemClick(itemId) {
        switch (itemId) {
            case 'current-branch':
                this.showBranchPicker();
                break;
            case 'error-count':
                this.showProblemsPanel();
                break;
            case 'warning-count':
                this.showProblemsPanel();
                break;
            case 'line-col':
                this.showGoToLine();
                break;
            case 'file-type':
                this.showLanguageSelector();
                break;
            case 'encoding':
                this.showEncodingSelector();
                break;
            case 'eol':
                this.showEOLSelector();
                break;
            case 'indent':
                this.showIndentSelector();
                break;
            case 'current-time':
                // Just show time, no action needed
                break;
        }
    }

    showBranchPicker() {
        // Would show Git branch picker
        console.log('Show branch picker');
    }

    showProblemsPanel() {
        // Switch to problems panel
        if (window.sidebarManager) {
            window.sidebarManager.switchPanel('problems');
        }
    }

    showGoToLine() {
        const line = prompt('Go to line:column', '1:1');
        if (line && window.editorManager) {
            window.editorManager.goToLine(line);
        }
    }

    showLanguageSelector() {
        // Would show language selector dropdown
        console.log('Show language selector');
    }

    showEncodingSelector() {
        // Would show encoding selector dropdown
        console.log('Show encoding selector');
    }

    showEOLSelector() {
        // Would show EOL selector dropdown
        console.log('Show EOL selector');
    }

    showIndentSelector() {
        // Would show indent selector dropdown
        console.log('Show indent selector');
    }

    updateErrorCount(count) {
        const errorElement = document.getElementById('error-count');
        if (errorElement) {
            errorElement.innerHTML = `<i class="fas fa-times-circle"></i> ${count}`;
            errorElement.title = `${count} Errors`;
            
            if (count > 0) {
                errorElement.style.color = '#f14c4c';
            } else {
                errorElement.style.color = '';
            }
        }
    }

    updateWarningCount(count) {
        const warningElement = document.getElementById('warning-count');
        if (warningElement) {
            warningElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${count}`;
            warningElement.title = `${count} Warnings`;
            
            if (count > 0) {
                warningElement.style.color = '#cca700';
            } else {
                warningElement.style.color = '';
            }
        }
    }

    updateLineCol(line, col) {
        const lineColElement = document.getElementById('line-col');
        if (lineColElement) {
            lineColElement.textContent = `Ln ${line}, Col ${col}`;
            lineColElement.title = `Line ${line}, Column ${col}`;
        }
    }

    updateFileType(language) {
        const fileTypeElement = document.getElementById('file-type');
        if (fileTypeElement) {
            const displayName = this.getLanguageDisplayName(language);
            fileTypeElement.textContent = displayName;
            fileTypeElement.title = `File Type: ${displayName}`;
        }
    }

    getLanguageDisplayName(language) {
        const languageMap = {
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'html': 'HTML',
            'css': 'CSS',
            'python': 'Python',
            'java': 'Java',
            'php': 'PHP',
            'json': 'JSON',
            'markdown': 'Markdown',
            'plaintext': 'Plain Text'
        };
        
        return languageMap[language] || language.charAt(0).toUpperCase() + language.slice(1);
    }

    updateEncoding(encoding) {
        const encodingElement = document.getElementById('encoding');
        if (encodingElement) {
            encodingElement.textContent = encoding;
            encodingElement.title = `Encoding: ${encoding}`;
        }
    }

    updateEOL(eol) {
        const eolElement = document.getElementById('eol');
        if (eolElement) {
            eolElement.textContent = eol;
            eolElement.title = `End of Line: ${eol}`;
        }
    }

    updateIndent(spaces) {
        const indentElement = document.getElementById('indent');
        if (indentElement) {
            indentElement.textContent = `Spaces: ${spaces}`;
            indentElement.title = `Indentation: ${spaces} spaces`;
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `status-notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.bottom = '30px';
        notification.style.right = '20px';
        notification.style.padding = '10px 20px';
        notification.style.background = type === 'error' ? '#f14c4c' : 
                                       type === 'warning' ? '#cca700' : 
                                       type === 'success' ? '#2ea043' : '#3794ff';
        notification.style.color = 'white';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '10000';
        notification.style.fontSize = '12px';
        
        document.body.appendChild(notification);
        
        // Remove after duration
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    setBusy(busy = true) {
        const statusbar = document.querySelector('.statusbar');
        if (busy) {
            statusbar.classList.add('busy');
            
            // Add spinner
            let spinner = document.getElementById('status-spinner');
            if (!spinner) {
                spinner = document.createElement('div');
                spinner.id = 'status-spinner';
                spinner.className = 'statusbar-item';
                spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                document.querySelector('.statusbar-left').prepend(spinner);
            }
        } else {
            statusbar.classList.remove('busy');
            
            // Remove spinner
            const spinner = document.getElementById('status-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }
}

// Initialize status bar manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.statusBarManager = new StatusBarManager();
});