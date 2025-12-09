const { spawn } = require("child_process");

function runCommand(command, args, callback) {
    const proc = spawn(command, args, { shell: true });

    proc.stdout.on("data", data => {
        callback(data.toString(), "stdout");
    });

    proc.stderr.on("data", data => {
        callback(data.toString(), "stderr");
    });

    proc.on("close", code => {
        callback(`\nProcess exited with code ${code}\n`, "exit");
    });

    return proc;
}

module.exports = { runCommand };
