// Passenger startup shim — Plesk/Passenger looks for app.js at the project root.
// This simply forwards to the prebuilt production bundle.
require("./dist/index.cjs");
