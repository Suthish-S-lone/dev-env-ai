class MonacoSetup {
    constructor() {
        this.editor = null;
        this.currentModel = null;
        this.isMonacoLoaded = false;
        this.init();
    }

    async init() {
        await this.loadMonaco();
        this.setupEditor();
        this.setupIntelliSense();
    }

    async loadMonaco() {
        // In Electron, we need to load Monaco differently
        return new Promise((resolve) => {
            if (window.monaco && window.monaco.editor) {
                this.isMonacoLoaded = true;
                resolve();
                return;
            }

            // Create a script element to load Monaco
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs/loader.min.js';

            script.onload = () => {
                // Configure Monaco loader
                if (typeof require !== 'undefined') {
                    require.config({
                        paths: {
                            vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs'
                        }
                    });

                    // Load Monaco editor
                    require(['vs/editor/editor.main'], () => {
                        this.isMonacoLoaded = true;
                        console.log('Monaco Editor loaded successfully');
                        resolve();
                    });
                } else {
                    // Fallback: Try direct loading
                    this.loadMonacoDirectly().then(resolve).catch(() => {
                        console.error('Failed to load Monaco Editor');
                        resolve(); // Resolve anyway to avoid blocking
                    });
                }
            };

            script.onerror = (error) => {
                console.error('Failed to load Monaco loader:', error);
                // Try fallback
                this.loadMonacoDirectly().then(resolve).catch(() => {
                    console.error('All Monaco loading methods failed');
                    resolve(); // Resolve anyway
                });
            };

            document.head.appendChild(script);
        });
    }

    async loadMonacoDirectly() {
        return new Promise((resolve, reject) => {
            // Try loading Monaco from CDN directly
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs/loader.min.js';

            script.onload = () => {
                // Monaco should now be available globally
                if (window.monaco && window.monaco.editor) {
                    this.isMonacoLoaded = true;
                    resolve();
                } else {
                    reject(new Error('Monaco not available after loading'));
                }
            };

            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupEditor() {
        // Wait for DOM to be ready
        if (!document.getElementById('editor-container')) {
            console.error('Editor container not found');
            return;
        }

        // Check if Monaco is loaded
        if (!this.isMonacoLoaded) {
            console.warn('Monaco not loaded, retrying...');
            setTimeout(() => this.setupEditor(), 100);
            return;
        }

        const editorContainer = document.getElementById('editor-container');

        try {
            // Create editor
            this.editor = monaco.editor.create(editorContainer, {
                value: '// Welcome to Code Editor\n// Start typing here...',
                language: 'javascript',
                theme: 'vs-dark',
                automaticLayout: true,
                fontSize: 14,
                lineNumbers: 'on',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                wrappingIndent: 'indent',
                renderLineHighlight: 'all',
                mouseWheelZoom: true,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                quickSuggestions: {
                    other: true,
                    comments: true,
                    strings: true
                },
                parameterHints: { enabled: true },
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true }
            });

            // Set VS Code dark theme
            this.setupThemes();

            // Listen for editor changes
            this.editor.onDidChangeModelContent((event) => {
                this.handleContentChange(event);
            });

            // Listen for cursor position changes
            this.editor.onDidChangeCursorPosition((event) => {
                this.handleCursorChange(event);
            });

            // Listen for model changes
            this.editor.onDidChangeModel((event) => {
                this.handleModelChange(event);
            });

            // Add keyboard shortcuts
            this.setupKeyboardShortcuts();

            // Store editor in global scope
            window.monacoEditor = this.editor;

            console.log('Monaco editor setup complete');

        } catch (error) {
            console.error('Error setting up Monaco editor:', error);
            // Show fallback message
            editorContainer.innerHTML = `
                <div style="padding: 20px; color: #cccccc; text-align: center;">
                    <h3>Editor Loading Failed</h3>
                    <p>Could not load Monaco Editor. Please check your internet connection.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    }

    setupThemes() {
        // Define VS Code dark theme
        monaco.editor.defineTheme('vs-code-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955' },
                { token: 'keyword', foreground: '569CD6' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'type', foreground: '4EC9B0' },
                { token: 'function', foreground: 'DCDCAA' },
                { token: 'variable', foreground: '9CDCFE' }
            ],
            colors: {
                'editor.background': '#1E1E1E',
                'editor.foreground': '#D4D4D4',
                'editor.lineHighlightBackground': '#2A2D2E',
                'editor.lineHighlightBorder': '#2A2D2E',
                'editorLineNumber.foreground': '#858585',
                'editorLineNumber.activeForeground': '#C6C6C6',
                'editor.selectionBackground': '#264F78',
                'editor.inactiveSelectionBackground': '#3A3D41',
                'editorCursor.foreground': '#AEAFAD',
                'editorWhitespace.foreground': '#3C3C3C'
            }
        });

        monaco.editor.setTheme('vs-code-dark');
    }

    setupIntelliSense() {
        if (!monaco.languages) {
            console.warn('Monaco languages not available');
            return;
        }

        try {
            // Register custom completion provider for JavaScript
            monaco.languages.registerCompletionItemProvider('javascript', {
                provideCompletionItems: (model, position) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    };

                    // Default JavaScript suggestions
                    const suggestions = [
                        {
                            label: 'console.log',
                            kind: monaco.languages.CompletionItemKind.Function,
                            documentation: 'Log output to console',
                            insertText: 'console.log(${1:value})',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: range
                        },
                        {
                            label: 'function',
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            documentation: 'Define a function',
                            insertText: 'function ${1:name}(${2:params}) {\n\t${3:// code}\n}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: range
                        },
                        {
                            label: 'if',
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            documentation: 'If statement',
                            insertText: 'if (${1:condition}) {\n\t${2:// code}\n}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: range
                        },
                        {
                            label: 'for',
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            documentation: 'For loop',
                            insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3:// code}\n}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: range
                        }
                    ];

                    return { suggestions: suggestions };
                }
            });

            console.log('IntelliSense setup complete');

        } catch (error) {
            console.error('Error setting up IntelliSense:', error);
        }
    }

    setupKeyboardShortcuts() {
        if (!this.editor) return;

        try {
            // Add custom keybindings
            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                this.saveCurrentFile();
            });

            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
                this.editor.getAction('actions.find').run();
            });

            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
                this.editor.getAction('editor.action.startFindReplaceAction').run();
            });

            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
                this.editor.getAction('editor.action.commentLine').run();
            });

        } catch (error) {
            console.error('Error setting up keyboard shortcuts:', error);
        }
    }

    handleContentChange(event) {
        if (window.editorManager) {
            window.editorManager.handleEditorChange(event);
        }
    }

    handleCursorChange(event) {
        const position = event.position;
        if (window.statusBarManager) {
            window.statusBarManager.updateLineCol(position.lineNumber, position.column);
        }
    }

    handleModelChange(event) {
        this.currentModel = this.editor.getModel();

        if (this.currentModel && window.tabManager) {
            const activeTab = window.tabManager.getActiveTab();
            if (activeTab) {
                // Update language based on file extension
                const language = this.getLanguageFromUri(this.currentModel.uri);
                if (language) {
                    try {
                        monaco.editor.setModelLanguage(this.currentModel, language);

                        if (window.statusBarManager) {
                            window.statusBarManager.updateFileType(language);
                        }
                    } catch (error) {
                        console.error('Error setting model language:', error);
                    }
                }
            }
        }
    }

    getLanguageFromUri(uri) {
        if (!uri) return null;

        const path = uri.path || uri.toString();
        const extension = path.split('.').pop().toLowerCase();

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
            'txt': 'plaintext'
        };

        return languageMap[extension] || 'plaintext';
    }

    saveCurrentFile() {
        if (window.editorManager) {
            window.editorManager.saveCurrentFile();
        }
    }

    getEditor() {
        return this.editor;
    }

    getValue() {
        return this.editor ? this.editor.getValue() : '';
    }

    setValue(value) {
        if (this.editor) {
            this.editor.setValue(value || '');
        }
    }

    setLanguage(language) {
        if (this.currentModel && monaco.editor) {
            try {
                monaco.editor.setModelLanguage(this.currentModel, language);
            } catch (error) {
                console.error('Error setting language:', error);
            }
        }
    }

    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    // Check if Monaco is ready
    isReady() {
        return this.isMonacoLoaded && this.editor !== null;
    }

    // Dispose method for cleanup
    dispose() {
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
    }
}

// Initialize Monaco when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.monacoSetup = new MonacoSetup();
});