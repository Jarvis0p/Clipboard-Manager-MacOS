# Clipboard Manager for macOS

A Windows Win+V style clipboard manager for your Mac. Press **⌘⌥V** (Cmd+Option+V) anytime to view and paste from your clipboard history—including text and images.

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/clipboard.git
cd clipboard
npm install
npm start
```

> Replace `YOUR_USERNAME` with your GitHub username after you create the repo.

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

## Pushing to GitHub

If you've cloned this and want to push to your own repo:

```bash
# Create a new repo on GitHub (e.g. github.com/yourusername/clipboard), then:
git remote add origin https://github.com/YOUR_USERNAME/clipboard.git
git push -u origin main
```
