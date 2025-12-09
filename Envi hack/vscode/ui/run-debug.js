// In run-debug.js
export function createRunDebugPanel() {
    return `
    <div class="left-panel" id="debug-panel">
        <div class="panel-title">Run and Debug</div>
        <div class="panel-content">
            <div style="padding: 20px 15px; text-align: center;">
                <div style="margin-bottom: 20px; font-size: 14px; color: #cccccc;">
                    <i class="fas fa-code" style="font-size: 32px; color: #007acc; margin-bottom: 15px; display: block;"></i>
                    To customize Run and Debug create a launch.json file.
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div class="panel-action-btn">
                        <i class="fas fa-plus-circle"></i> Create a launch.json file
                    </div>
                    <div style="font-size: 12px; color: #999999; margin-top: 20px; text-align: left;">
                        Debug using a terminal command or in an interactive chat.
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}