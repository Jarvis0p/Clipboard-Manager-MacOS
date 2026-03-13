const { app, BrowserWindow, globalShortcut, clipboard, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');

let mainWindow = null;
let clipboardHistory = [];
let lastClipboardFingerprint = '';
let lastFrontmostApp = '';
let isPasting = false;
const MAX_HISTORY = 50;
const STORAGE_PATH = path.join(app.getPath('userData'), 'clipboard-history.json');

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: 420,
    height: 500,
    x: Math.floor(width / 2 - 210),
    y: Math.floor(height / 2 - 250),
    frame: false,
    transparent: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.on('blur', () => {
    if (!isPasting) mainWindow.hide();
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
}

function getClipboardContent() {
  const formats = clipboard.availableFormats();
  
  if (formats.includes('image/png') || formats.includes('image/jpeg')) {
    const image = clipboard.readImage();
    if (!image.isEmpty()) {
      return {
        type: 'image',
        data: image.toDataURL(),
        preview: image.toDataURL(),
      };
    }
  }

  const text = clipboard.readText();
  if (text && text.trim()) {
    return {
      type: 'text',
      data: text,
      preview: text.length > 100 ? text.substring(0, 100) + '...' : text,
    };
  }

  const html = clipboard.readHTML();
  if (html && html.trim()) {
    const plainText = html.replace(/<[^>]*>/g, '').trim();
    if (plainText) {
      return {
        type: 'text',
        data: plainText,
        preview: plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText,
      };
    }
  }

  return null;
}

function addToHistory(item) {
  if (!item) return;
  
  const lastItem = clipboardHistory[0];
  if (lastItem && lastItem.data === item.data && lastItem.type === item.type) {
    return;
  }

  clipboardHistory.unshift(item);
  if (clipboardHistory.length > MAX_HISTORY) {
    clipboardHistory.pop();
  }
  saveHistory();
}

function getFingerprint(content) {
  if (!content) return '';
  if (content.type === 'image') return 'img:' + content.data.substring(0, 50);
  return 'txt:' + content.data;
}

function loadHistory() {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const data = fs.readFileSync(STORAGE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        clipboardHistory = parsed.slice(0, MAX_HISTORY);
      }
    }
  } catch (e) {
    console.error('Failed to load history:', e);
  }
}

function saveHistory() {
  try {
    const toSave = clipboardHistory.map(item => ({
      type: item.type,
      data: item.data,
      preview: item.preview || (item.type === 'text' ? item.data.substring(0, 100) : ''),
    }));
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}

function pollClipboard() {
  const content = getClipboardContent();
  const fingerprint = getFingerprint(content);
  
  if (fingerprint && fingerprint !== lastClipboardFingerprint) {
    lastClipboardFingerprint = fingerprint;
    addToHistory(content);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('clipboard-updated', clipboardHistory);
    }
  }
}

function toggleWindow() {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    exec('osascript -e "tell application \\"System Events\\" to get name of first process whose frontmost is true"', (err, stdout) => {
      lastFrontmostApp = (stdout || '').trim() || 'Finder';
      mainWindow.webContents.send('clipboard-updated', clipboardHistory);
      mainWindow.show();
      mainWindow.focus();
    });
  }
}

app.whenReady().then(() => {
  loadHistory();
  const content = getClipboardContent();
  if (content) {
    lastClipboardFingerprint = getFingerprint(content);
    addToHistory(content);
  }

  createWindow();

  globalShortcut.register('CommandOrControl+Alt+V', () => {
    toggleWindow();
  });

  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  setInterval(pollClipboard, 500);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    toggleWindow();
  }
});


app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle('get-history', () => clipboardHistory);

function simulatePaste() {
  const args = lastFrontmostApp
    ? [
        '-e', `tell application "${lastFrontmostApp.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}" to activate`,
        '-e', 'delay 0.35',
        '-e', 'tell application "System Events" to keystroke "v" using command down'
      ]
    : ['-e', 'tell application "System Events" to keystroke "v" using command down'];
  spawn('osascript', args, { stdio: 'ignore', detached: true }).unref();
}

ipcMain.on('paste-item', (event, index) => {
  const item = clipboardHistory[Number(index)];
  if (!item) return;

  isPasting = true;

  if (item.type === 'image') {
    const { nativeImage } = require('electron');
    const img = nativeImage.createFromDataURL(item.data);
    if (img.isEmpty()) {
      isPasting = false;
      return;
    }
    clipboard.writeImage(img);
  } else {
    clipboard.writeText(String(item.data));
  }

  mainWindow.hide();
  app.hide();

  setTimeout(() => {
    simulatePaste();
    setTimeout(() => { isPasting = false; }, 500);
  }, 250);
});

ipcMain.on('delete-item', (event, index) => {
  clipboardHistory.splice(index, 1);
  mainWindow.webContents.send('clipboard-updated', clipboardHistory);
});

ipcMain.on('close-window', () => {
  mainWindow.hide();
});
