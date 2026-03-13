# Clipboard Manager for macOS

A Windows Win+V style clipboard manager for your Mac. Press **⌘⌥V** (Cmd+Option+V) anytime to view and paste from your clipboard history—including text and images.

## Quick Start

```bash
git clone https://github.com/Jarvis0p/Clipboard-Manager-MacOS.git
cd clipboard
npm install
npm start
```

## Requirements

- macOS
- Node.js 18+ (install from [nodejs.org](https://nodejs.org) or via `nvm`)

## Features

- **Global shortcut**: `⌘⌥V` opens the clipboard panel from anywhere
- **Text & images**: Stores both copied text and images
- **Search**: Filter your history instantly
- **Persistent**: History survives app restarts (stored locally)
- **Click to paste**: Select an item to copy it to clipboard, then paste with `⌘V`

## Usage

1. Run the app: `npm start`
3. Copy anything (text or images) as you normally would
4. Press **⌘⌥V** to open your clipboard history
5. Click an item to paste it (or use `⌘V` after selecting)

## Auto-start at login

To have the clipboard manager start automatically when you log in:

```bash
npm run setup-startup
```

Then log out and back in (or restart your Mac). The app will run in the background.

To disable:
```bash
npm run remove-startup
```

## Tips

- The app runs in the background—no dock icon
- Hover over items to see paste/delete actions
- Press Escape to clear search and close

## macOS Auto-Paste

Clicking an item copies it to clipboard and automatically pastes into the app you were using before opening the clipboard panel.

**Required: Accessibility permission.** Without it, auto-paste will not work. Grant it:

1. Open **System Settings → Privacy & Security → Accessibility**
2. Click **+** and add **Terminal** (if you run with `npm start`) or **Electron**
3. Ensure the checkbox is enabled
4. Restart the clipboard app after granting permission

## Building a Release (DMG)

To create a distributable DMG that users can download and install:

```bash
npm run build
```

The DMG will be in the `dist/` folder (e.g. `dist/Clipboard-1.0.0-arm64.dmg`). Users can:
1. Open the DMG
2. Drag "Clipboard" to Applications
3. Launch it from Applications (or Spotlight)

For the built app, add **Clipboard** (not Terminal/Electron) to Accessibility in System Settings.

> **Note:** The default build targets Apple Silicon (M1/M2/M3). For Intel Macs, run `npm run build:universal` to create both arm64 and x64 DMGs.

## Creating GitHub Releases

**Option A: Manual**
1. Build the DMG: `npm run build`
2. Go to your repo on GitHub → **Releases** → **Create a new release**
3. Tag version (e.g. `v1.0.0`), add release notes
4. Upload the `.dmg` file from `dist/` as an asset
5. Publish the release

**Option B: Automated (GitHub Actions)**
1. Create and push a tag: `git tag v1.0.0 && git push origin v1.0.0`
2. The workflow will build the DMG and attach it to the release automatically

Users can then download the DMG directly without needing Node.js.

## Pushing to GitHub

If you've cloned this and want to push to your own repo:

```bash
# Create a new repo on GitHub (e.g. github.com/yourusername/clipboard), then:
git remote add origin https://github.com/YOUR_USERNAME/clipboard.git
git push -u origin main
```
