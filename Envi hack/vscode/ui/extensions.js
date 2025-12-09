// In extensions.js
export function createExtensionsPanel() {
    return `
    <div class="left-panel" id="extensions-panel">
        <div class="panel-title">Extensions</div>
        <div class="panel-content">
            <div style="padding: 15px;">
                <!-- Search Extensions -->
                <div style="background-color: #3c3c3c; border-radius: 2px; padding: 5px 10px; display: flex; align-items: center; margin-bottom: 20px;">
                    <i class="fas fa-search" style="color: #cccccc; margin-right: 8px; font-size: 12px;"></i>
                    <input type="text" placeholder="Search Extensions in Marketplace" style="background: transparent; border: none; color: #cccccc; width: 100%; outline: none; font-size: 13px;">
                </div>
                
                <!-- Categories -->
                <div style="margin-bottom: 20px;">
                    <div class="panel-item" style="background-color: #2a2d2e;">
                        <i class="fas fa-star"></i> Recommended
                    </div>
                    <div class="panel-item">
                        <i class="fas fa-cloud-download-alt"></i> Installed
                        <span style="margin-left: auto; font-size: 11px; color: #999999;">24</span>
                    </div>
                    <div class="panel-item">
                        <i class="fas fa-trending-up"></i> Popular
                    </div>
                </div>
                
                <!-- Featured Extensions -->
                <div style="border-top: 1px solid #3e3e42; padding-top: 15px;">
                    <div style="font-size: 12px; color: #999999; margin-bottom: 10px; text-transform: uppercase;">
                        Featured
                    </div>
                    
                    <div class="extension-item">
                        <div style="font-size: 13px; color: #cccccc; margin-bottom: 5px;">Prettier - Code formatter</div>
                        <div style="font-size: 11px; color: #999999;">VS Code package</div>
                    </div>
                    
                    <div class="extension-item">
                        <div style="font-size: 13px; color: #cccccc; margin-bottom: 5px;">ESLint</div>
                        <div style="font-size: 11px; color: #999999;">Integrates ESLint into VS Code</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}