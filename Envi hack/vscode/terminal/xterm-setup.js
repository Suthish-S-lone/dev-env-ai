class XTermSetup {
    constructor() {
        this.terminal = null;
        this.fitAddon = null;
        this.currentLine = '';
        this.undoStack = [];
        this.init();
    }

    init() {
        this.setupTerminal();
    }

    setupTerminal() {
        const terminalContainer = document.getElementById('terminal-container');

        if (!window.Terminal) {
            console.error('Terminal library not loaded');
            if (terminalContainer) {
                terminalContainer.innerHTML = '<div style="color: red; padding: 10px;">Error: Terminal library failed to load. Please check your internet connection.</div>';
            }
            return;
        }

        // Create terminal
        this.terminal = new Terminal({
            theme: {
                background: '#1e1e1e',
                foreground: '#cccccc',
                cursor: '#ffffff',
                black: '#000000',
                red: '#cd3131',
                green: '#0dbc79',
                yellow: '#e5e510',
                blue: '#2472c8',
                magenta: '#bc3fbc',
                cyan: '#11a8cd',
                white: '#e5e5e5',
                brightBlack: '#666666',
                brightRed: '#f14c4c',
                brightGreen: '#23d18b',
                brightYellow: '#f5f543',
                brightBlue: '#3b8eea',
                brightMagenta: '#d670d6',
                brightCyan: '#29b8db',
                brightWhite: '#e5e5e5'
            },
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
            cursorBlink: true,
            cursorStyle: 'block',
            scrollback: 1000,
            convertEol: true,
            disableStdin: false // Re-enable so we get events
        });

        // Load fit addon
        if (window.FitAddon) {
            this.fitAddon = new FitAddon.FitAddon();
            this.terminal.loadAddon(this.fitAddon);
        }

        // Custom Key Event Handler for Clipboard
        this.terminal.attachCustomKeyEventHandler((arg) => {
            // Clipboard: Ctrl+C (Copy)
            if (arg.type === 'keydown' && arg.ctrlKey && arg.key === 'c') {
                const selection = this.terminal.getSelection();
                if (selection) {
                    navigator.clipboard.writeText(selection);
                    return false; // Handled
                }
                // If no selection, let it fall through to handleChar for SIGINT (Ctrl+C behavior)
            }

            // Clipboard: Ctrl+V (Paste)
            if (arg.type === 'keydown' && arg.ctrlKey && arg.key === 'v') {
                navigator.clipboard.readText().then(text => {
                    // Feed into handleChar loop to buffer it correctly
                    for (let i = 0; i < text.length; i++) {
                        this.handleChar(text[i]);
                    }
                });
                return false; // Handled
            }

            // Undo: Ctrl+Z
            if (arg.type === 'keydown' && arg.ctrlKey && arg.key === 'z') {
                this.handleChar(String.fromCharCode(26));
                return false; // Handled
            }

            // Backspace (Force local handling)
            if (arg.type === 'keydown' && arg.key === 'Backspace') {
                this.handleChar(String.fromCharCode(8));
                return false; // Handled
            }

            return true;
        });

        // Open terminal
        this.terminal.open(terminalContainer);

        if (this.fitAddon) {
            this.fitAddon.fit();
        }

        // Handle resize
        window.addEventListener('resize', () => {
            if (this.fitAddon) {
                this.fitAddon.fit();
            }
        });

        // INPUT HANDLING: Local Line Buffer
        this.terminal.onData(e => {
            // Prevent double echo/handling if custom handler dealt with it? 
            // Standard onData logic for typing:
            for (let i = 0; i < e.length; i++) {
                this.handleChar(e[i]);
            }
        });

        // Listen for incoming data from backend (Command Output)
        if (window.api && window.api.onTerminalData) {
            window.api.onTerminalData((data) => {
                this.terminal.write(data);
            });

            // Start the terminal process
            if (window.api.createTerminal) {
                window.api.createTerminal();
            }
        } else if (this.terminal) {
            this.terminal.writeln('Error: Terminal API not available.');
        }
    }

    handleChar(char) {
        const code = char.charCodeAt(0);

        if (code === 13) { // Enter (\r)
            this.terminal.write('\r\n'); // Echo newline locally
            if (window.api && window.api.writeTerminal) {
                window.api.writeTerminal(this.currentLine + '\r\n'); // Send buffer
            }
            this.currentLine = '';
            this.undoStack = []; // Reset undo for new line
        }
        else if (code === 127 || code === 8) { // Backspace
            if (this.currentLine.length > 0) {
                // Save state for undo (optional, effectively handled by typing)
                this.currentLine = this.currentLine.slice(0, -1);
                // Visual backspace: Move back, write space, move back
                this.terminal.write('\b \b');
            }
        }
        else if (code === 26) { // Ctrl+Z (Undo last typing)
            if (this.undoStack.length > 0) {
                const previousState = this.undoStack.pop();

                // Clear current visual line
                let deleteCount = this.currentLine.length;
                for (let i = 0; i < deleteCount; i++) {
                    this.terminal.write('\b \b');
                }

                // Restore previous
                this.currentLine = previousState;
                this.terminal.write(this.currentLine);
            }
        }
        else if (code === 3) { // Ctrl+C
            this.terminal.write('^C\r\n');
            if (window.api && window.api.writeTerminal) {
                // Send break signal if possible (though for spawn it might be tricky, sending empty line is safest)
                // Note: spawn might not handle \x03 as SIGINT without extra logic, but let's try.
                // Ideally we just clear buffer.
            }
            this.currentLine = '';
            this.undoStack = [];
        }
        else if (code >= 32) { // Printable characters
            this.undoStack.push(this.currentLine); // Save state before edit
            this.currentLine += char;
            this.terminal.write(char);
        }
    }

    // Public methods
    executeCommand(command) {
        if (window.api && window.api.writeTerminal) {
            this.terminal.writeln(command); // Echo
            window.api.writeTerminal(command + '\r\n'); // Send
        }
    }

    clear() {
        if (this.terminal) {
            this.terminal.clear();
            this.currentLine = '';
            this.undoStack = [];
        }
    }

    write(text) {
        if (this.terminal) {
            this.terminal.write(text);
        }
    }

    writeln(text) {
        if (this.terminal) {
            this.terminal.writeln(text);
        }
    }

    focus() {
        if (this.terminal) {
            this.terminal.focus();
        }
    }

    resize() {
        if (this.fitAddon) {
            this.fitAddon.fit();
        }
    }
}

// Initialize terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.xtermSetup = new XTermSetup();
});