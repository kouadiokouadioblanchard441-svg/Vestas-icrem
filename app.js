// Passenger startup shim — Plesk/Passenger looks for app.js at the project root.
// Errors are written to passenger-error.log next to this file for diagnosis.
const path = require("path");
const fs = require("fs");

const logFile = path.join(__dirname, "passenger-error.log");

function logError(err) {
  const msg = `[${new Date().toISOString()}] STARTUP ERROR:\n${err && err.stack ? err.stack : String(err)}\n\n`;
  try { fs.appendFileSync(logFile, msg); } catch (_) {}
  console.error(msg);
}

process.on("uncaughtException", logError);
process.on("unhandledRejection", logError);

try {
  require("./dist/index.cjs");
} catch (err) {
  logError(err);
  process.exit(1);
}
