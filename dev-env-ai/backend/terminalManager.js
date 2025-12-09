// backend/terminalManager.js
console.log("terminalManager.js loaded");

// Option C: Dummy PTY (no real system terminal)
function spawnPty() {
  return {
    write: (cmd) => console.log("Dummy PTY received command:", cmd),
    onData: (cb) => cb("Dummy PTY active (no real terminal)"),
    kill: () => console.log("Dummy PTY closed")
  };
}

module.exports = { spawnPty };
