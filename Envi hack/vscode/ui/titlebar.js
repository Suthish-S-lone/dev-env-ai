document.addEventListener('DOMContentLoaded', () => {
    console.log('Titlebar script loaded');
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    const maximizeIcon = maximizeBtn.querySelector('i');

    // Update maximize icon based on window state
    const updateMaximizeIcon = () => {
        if (document.body.classList.contains('maximized')) {
            maximizeIcon.className = 'far fa-window-restore';
        } else {
            maximizeIcon.className = 'far fa-square';
        }
    };

    // Window controls
    minimizeBtn.addEventListener('click', () => {
        window.api.minimizeWindow();
    });

    maximizeBtn.addEventListener('click', () => {
        window.api.maximizeWindow();
    });

    closeBtn.addEventListener('click', () => {
        window.api.closeWindow();
    });

    // Run Button
    const runBtn = document.getElementById('run-btn');
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            // Execute run command in terminal
            if (window.xtermSetup) {
                window.xtermSetup.executeCommand('node index.js'); // Default run command
            } else {
                alert('Terminal not ready');
            }
        });
    }

    // Listen for window state changes from Main process
    window.api.onWindowMaximized(() => {
        document.body.classList.add('maximized');
        updateMaximizeIcon();
    });

    window.api.onWindowUnmaximized(() => {
        document.body.classList.remove('maximized');
        updateMaximizeIcon();
    });

    // Initial update
    updateMaximizeIcon();
});