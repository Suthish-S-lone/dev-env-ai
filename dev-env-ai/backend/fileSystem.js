// backend/fileSystem.js
const fs = require("fs");
const path = require("path");

// Ensure a folder exists
function ensureDir(dir) {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    } catch (err) {
        console.error("ensureDir error:", err);
        throw err;
    }
}

// Write file safely (creates parent folders automatically)
function writeFileSafe(targetPath, content) {
    try {
        ensureDir(path.dirname(targetPath));
        fs.writeFileSync(targetPath, content);
    } catch (err) {
        console.error("writeFileSafe error:", err);
        throw err;
    }
}

// Create a project with folders + files
function createProject(basePath, structure) {
    ensureDir(basePath);

    if (structure.folders) {
        for (const folder of structure.folders) {
            const folderPath = path.join(basePath, folder.name);
            ensureDir(folderPath);
            createProject(folderPath, folder);
        }
    }

    if (structure.files) {
        for (const file of structure.files) {
            const filePath = path.join(basePath, file.name);
            writeFileSafe(filePath, file.content || "");
        }
    }
}

// Read directory contents
function readDir(dir) {
    try {
        return fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
        console.error("readDir error:", err);
        return [];
    }
}

// Read file
function readFile(file) {
    try {
        return fs.readFileSync(file, "utf8");
    } catch (err) {
        console.error("readFile error:", err);
        return "";
    }
}

// Save file (frontend → backend)
function saveFile(filePath, content) {
    try {
        writeFileSafe(filePath, content);
        return true;
    } catch (err) {
        console.error("saveFile error:", err);
        return false;
    }
}

module.exports = {
    createProject,
    readDir,
    readFile,
    writeFileSafe,
    saveFile,
    ensureDir
};
