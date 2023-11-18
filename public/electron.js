const { app , BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const isDev = require('electron-is-dev');

app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  mainWindow.loadURL(isDev ? 'https://demo.locker.io:3000' : `file://${path.join(__dirname, "../build/index.html")}`);

  mainWindow.webContents.openDevTools();
  mainWindow.on('close', function() {
    mainWindow = null;
  })
}

app.on('ready', () => {
  ipcMain.handle('ping', () => 'pong')
  createWindow()
})

app.on('window-all-closed', function () {
  app.quit()
})

app.on('active', function () {
  if (!mainWindow) {
    createWindow()
  }
})