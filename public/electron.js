const { app , BrowserWindow, ipcMain, protocol  } = require('electron');
const path = require('node:path');
const isDev = require('electron-is-dev');
const url = require('url');

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

  const startUrl = isDev ? 'https://demo.locker.io:3000' : url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    hash: '/add',
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', function() {
    mainWindow = null;
  })
}

app.on('ready', () => {
  createWindow();
})

app.on('window-all-closed', function () {
  app.quit()
})

app.on('active', function () {
  if (!mainWindow) {
    createWindow()
  }
})