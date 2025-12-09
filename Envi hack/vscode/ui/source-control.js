// In source-control.js
export function createSourceControlPanel() {
    return `
    <div class="left-panel" id="git-panel">
        <div class="panel-title">Source Control</div>
        <div class="panel-content">
            <div style="padding: 20px 15px;">
                <div style="font-size: 14px; color: #cccccc; margin-bottom: 20px;">
                    The folder currently open doesn't have a Git repository. You can initialize a repository which will enable source control features powered by Git.
                </div>
                
                <div class="panel-action-btn" style="margin-bottom: 20px;">
                    <i class="fas fa-code-branch"></i> Initialize Repository
                </div>
                
                <div style="font-size: 12px; color: #999999; margin-bottom: 25px;">
                    To learn more about how to use Git and source control in VS Code read our docs.
                </div>
                
                <div style="border-top: 1px solid #3e3e42; padding-top: 20px;">
                    <div style="font-size: 14px; color: #cccccc; margin-bottom: 15px;">
                        You can directly publish this folder to a GitHub repository. Once published, you'll have access to source control features powered by Git and GitHub.
                    </div>
                    
                    <div class="panel-action-btn">
                        <i class="fab fa-github"></i> Publish to GitHub
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}