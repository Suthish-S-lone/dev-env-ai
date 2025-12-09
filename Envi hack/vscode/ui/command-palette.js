class CommandPalette {
    constructor() {
        this.commands = [];
        this.isOpen = false;
        this.selectedIndex = 0;
        this.filteredCommands = [];
        this.recentCommands = [];

        this.init();
    }

    init() {
        // Load recent commands
        try {
            const saved = localStorage.getItem('recentCommands');
            if (saved) {
                this.recentCommands = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading recent commands', e);
        }

        // Create UI elements if valid (will be injected by HTML or script)
        this.overlay = document.getElementById('command-palette-overlay');
        this.input = document.getElementById('command-palette-input');
        this.list = document.getElementById('command-palette-list');

        if (!this.overlay || !this.input || !this.list) {
            console.error('Command Palette UI elements not found');
            return;
        }

        this.setupEventListeners();
    }

    registerCommand(id, label, handler, shortcut = '') {
        // Avoid duplicates
        const existing = this.commands.findIndex(c => c.id === id);
        if (existing !== -1) {
            this.commands[existing] = { id, label, handler, shortcut };
        } else {
            this.commands.push({ id, label, handler, shortcut });
        }
    }

    setupEventListeners() {
        // Close on overlay click (top/bottom distinct from container)
        this.overlay.addEventListener('mousedown', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // Input handling
        this.input.addEventListener('input', (e) => {
            this.filter(e.target.value);
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectNext();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectPrev();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.executeSelected();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.hide();
            }
        });
    }

    show() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.overlay.style.display = 'flex';
        this.input.value = '>'; // Emulate VS Code default
        this.input.focus();
        this.input.setSelectionRange(1, 1); // Cursor after '>'

        this.filter('');
    }

    hide() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.overlay.style.display = 'none';

        // Return focus to editor if possible
        if (window.monacoEditor) {
            window.monacoEditor.focus();
        }
    }

    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    filter(text) {
        // If text starts with '>', strip it for matching
        const query = text.startsWith('>') ? text.substring(1).trim() : text;
        const lowerQuery = query.toLowerCase();

        this.filteredCommands = [];

        // Simple fuzzy search: Check if label contains query
        // Enhance: split query by space?

        let matches = [];

        if (!query) {
            // If empty query, show recently used first, then others
            const recent = this.commands.filter(c => this.recentCommands.includes(c.id));
            const others = this.commands.filter(c => !this.recentCommands.includes(c.id));

            if (recent.length > 0) {
                this.filteredCommands = [
                    { type: 'separator', label: 'recently used' },
                    ...recent,
                    { type: 'separator', label: 'other commands' },
                    ...others
                ];
            } else {
                this.filteredCommands = this.commands;
            }
        } else {
            // Filter commands
            const exactMatches = [];
            const partialMatches = [];

            this.commands.forEach(cmd => {
                const index = cmd.label.toLowerCase().indexOf(lowerQuery);
                if (index !== -1) {
                    if (index === 0) exactMatches.push(cmd);
                    else partialMatches.push(cmd);
                }
            });

            // Sort exact matches by label length (shorter match is likely better)
            exactMatches.sort((a, b) => a.label.length - b.label.length);

            this.filteredCommands = [...exactMatches, ...partialMatches];
        }

        this.selectedIndex = 0;
        // Skip separators for initial selection
        while (this.filteredCommands[this.selectedIndex] && this.filteredCommands[this.selectedIndex].type === 'separator') {
            this.selectedIndex++;
        }

        this.renderList(query);
    }

    renderList(query) {
        this.list.innerHTML = '';

        if (this.filteredCommands.length === 0) {
            const noRes = document.createElement('div');
            noRes.classList.add('command-item');
            noRes.style.cursor = 'default';
            noRes.textContent = 'No matching commands';
            this.list.appendChild(noRes);
            return;
        }

        this.filteredCommands.forEach((cmd, index) => {
            if (cmd.type === 'separator') {
                const sep = document.createElement('div');
                sep.className = 'command-separator';
                sep.innerHTML = `<span>${cmd.label}</span>`;
                this.list.appendChild(sep);
                return;
            }

            const item = document.createElement('div');
            item.className = 'command-item';
            if (index === this.selectedIndex) item.classList.add('active');

            // Highlight text
            let labelHtml = cmd.label;
            if (query) {
                // Determine highlighting
                const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                labelHtml = cmd.label.replace(regex, '<span class="highlight">$1</span>');
            }

            const labelSpan = document.createElement('span');
            labelSpan.className = 'command-label';
            labelSpan.innerHTML = labelHtml;

            const shortcutSpan = document.createElement('span');
            shortcutSpan.className = 'command-shortcut';
            shortcutSpan.textContent = cmd.shortcut;

            item.appendChild(labelSpan);
            item.appendChild(shortcutSpan);

            item.addEventListener('click', () => {
                this.executeCommand(cmd);
            });

            this.list.appendChild(item);
        });

        // Ensure active item is visible
        this.scrollToActive();
    }

    scrollToActive() {
        // Need to account for separators in index to DOM mapping is tricky if we don't track it
        // Simpler: find element with .active class
        const activeItem = this.list.querySelector('.command-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }

    selectNext() {
        let nextIndex = this.selectedIndex + 1;

        // Skip separators
        while (nextIndex < this.filteredCommands.length && this.filteredCommands[nextIndex].type === 'separator') {
            nextIndex++;
        }

        if (nextIndex < this.filteredCommands.length) {
            this.selectedIndex = nextIndex;
            this.renderList(this.input.value.startsWith('>') ? this.input.value.substring(1).trim() : this.input.value);
        }
    }

    selectPrev() {
        let prevIndex = this.selectedIndex - 1;

        // Skip separators
        while (prevIndex >= 0 && this.filteredCommands[prevIndex].type === 'separator') {
            prevIndex--;
        }

        if (prevIndex >= 0) {
            this.selectedIndex = prevIndex;
            this.renderList(this.input.value.startsWith('>') ? this.input.value.substring(1).trim() : this.input.value);
        }
    }

    executeSelected() {
        const cmd = this.filteredCommands[this.selectedIndex];
        if (cmd && cmd.type !== 'separator') {
            this.executeCommand(cmd);
        }
    }

    executeCommand(cmd) {
        this.hide();

        // Add to recent
        this.addToRecent(cmd.id);

        if (typeof cmd.handler === 'function') {
            cmd.handler();
        }
    }

    addToRecent(id) {
        // Remove if exists
        this.recentCommands = this.recentCommands.filter(c => c !== id);
        // Add to front
        this.recentCommands.unshift(id);
        // Keep max 10
        if (this.recentCommands.length > 10) {
            this.recentCommands.pop();
        }

        localStorage.setItem('recentCommands', JSON.stringify(this.recentCommands));
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.commandPalette = new CommandPalette();
});
