// In search.js
export function createSearchPanel() {
    return `
    <div class="left-panel" id="search-panel">
        <div class="panel-title">Search</div>
        <div class="panel-content">
            <div style="padding: 15px;">
                <!-- Search Input -->
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 11px; color: #999999; margin-bottom: 5px; text-transform: uppercase;">
                        Search
                    </div>
                    <div style="background-color: #3c3c3c; border: 1px solid #007acc; border-radius: 2px; padding: 5px 10px; display: flex; align-items: center;">
                        <i class="fas fa-search" style="color: #cccccc; margin-right: 8px; font-size: 12px;"></i>
                        <input type="text" placeholder="" style="background: transparent; border: none; color: #cccccc; width: 100%; outline: none; font-size: 13px;">
                        <div style="font-size: 11px; color: #999999; background: #2d2d30; padding: 2px 6px; border-radius: 2px; margin-left: 8px;">
                            Aa
                        </div>
                    </div>
                </div>
                
                <!-- Replace Input -->
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 11px; color: #999999; margin-bottom: 5px; text-transform: uppercase;">
                        Replace
                    </div>
                    <div style="background-color: #3c3c3c; border: 1px solid #3e3e42; border-radius: 2px; padding: 5px 10px; display: flex; align-items: center;">
                        <input type="text" placeholder="" style="background: transparent; border: none; color: #cccccc; width: 100%; outline: none; font-size: 13px;">
                        <div style="font-size: 11px; color: #999999; background: #2d2d30; padding: 2px 6px; border-radius: 2px; margin-left: 8px;">
                            AB
                        </div>
                    </div>
                </div>
                
                <!-- Search Results Area -->
                <div style="border-top: 1px solid #3e3e42; padding-top: 15px;">
                    <div style="color: #999999; font-size: 13px; text-align: center; padding: 20px;">
                        No results found
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}