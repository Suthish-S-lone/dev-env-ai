const path = require("path");
const { createProject } = require("./fileSystem");

console.log("Testing file creation...");

const output = path.join(__dirname, "test_output");

createProject(output, {
    files: [
        { name: "Dockerfile", content: "FROM python:3.10-slim" },
        { name: "devcontainer.json", content: "{ \"name\": \"Test\" }" }
    ],
    folders: [
        {
            name: "src",
            files: [
                { name: "app.py", content: "print('Hello World')" }
            ]
        }
    ]
});

console.log("DONE! Created test_output folder in backend/");
