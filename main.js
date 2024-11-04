const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  win.loadFile('src/index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const storagePath = path.join(__dirname, 'storage.json');

ipcMain.handle('load-notes', () => {
  if (!fs.existsSync(storagePath)) return [];
  const data = fs.readFileSync(storagePath);
  return JSON.parse(data);
});

ipcMain.handle('save-note', (event, note) => {
  let notes = [];
  if (fs.existsSync(storagePath)) {
    notes = JSON.parse(fs.readFileSync(storagePath));
  }
  notes.push(note);
  fs.writeFileSync(storagePath, JSON.stringify(notes));
});

ipcMain.handle('update-note', (event, updatedNote) => {
  const notes = JSON.parse(fs.readFileSync(storagePath));
  const noteIndex = notes.findIndex(note => note.id === updatedNote.id);
  if (noteIndex !== -1) {
    notes[noteIndex] = updatedNote;
    fs.writeFileSync(storagePath, JSON.stringify(notes));
  }
});

ipcMain.handle('delete-note', (event, noteId) => {
  let notes = JSON.parse(fs.readFileSync(storagePath));
  notes = notes.filter(note => note.id !== noteId);
  fs.writeFileSync(storagePath, JSON.stringify(notes));
});
