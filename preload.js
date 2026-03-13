const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipboardAPI', {
  getHistory: () => ipcRenderer.invoke('get-history'),
  onClipboardUpdated: (callback) => {
    ipcRenderer.on('clipboard-updated', (_, history) => callback(history));
  },
  pasteItem: (index) => ipcRenderer.send('paste-item', Number(index)),
  deleteItem: (index) => ipcRenderer.send('delete-item', index),
  closeWindow: () => ipcRenderer.send('close-window'),
});
