#!/usr/bin/env node
/**
 * Sets up the clipboard manager to auto-start when you log in to your Mac.
 * Run: npm run setup-startup
 * To remove: npm run remove-startup
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..');
const PLIST_LABEL = 'com.clipboard.manager';
const LAUNCH_AGENTS_DIR = path.join(process.env.HOME, 'Library', 'LaunchAgents');
const PLIST_PATH = path.join(LAUNCH_AGENTS_DIR, `${PLIST_LABEL}.plist`);

function getElectronPath() {
  try {
    return require('electron');
  } catch {
    const altPath = path.join(APP_DIR, 'node_modules', 'electron', 'dist', 'Electron.app', 'Contents', 'MacOS', 'Electron');
    if (fs.existsSync(altPath)) return altPath;
    throw new Error('Electron not found. Run "npm install" first.');
  }
}

function setup() {
  if (process.platform !== 'darwin') {
    console.log('Auto-start is only supported on macOS.');
    process.exit(1);
  }

  const electronPath = getElectronPath();
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${PLIST_LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${electronPath}</string>
    <string>${APP_DIR}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${APP_DIR}</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <false/>
</dict>
</plist>
`;

  if (!fs.existsSync(LAUNCH_AGENTS_DIR)) {
    fs.mkdirSync(LAUNCH_AGENTS_DIR, { recursive: true });
  }

  fs.writeFileSync(PLIST_PATH, plist);
  console.log('✓ Clipboard manager will start automatically when you log in.');
  console.log('  Log out and back in (or restart your Mac) to apply.');
}

function remove() {
  if (process.platform !== 'darwin') {
    console.log('Auto-start is only supported on macOS.');
    process.exit(1);
  }

  if (fs.existsSync(PLIST_PATH)) {
    fs.unlinkSync(PLIST_PATH);
    console.log('✓ Auto-start at login has been disabled.');
  } else {
    console.log('Auto-start was not configured.');
  }
}

const cmd = process.argv[2];
if (cmd === 'remove') {
  remove();
} else {
  setup();
}
