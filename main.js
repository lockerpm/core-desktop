const electron = require('electron');
const { app , BrowserWindow } = electron;
const url = require('url');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false
    }
  })
  // mainWindow.loadURL(`https://localhost:3000`);
  const startUrl = url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file',
  });  mainWindow.loadURL(startUrl);

  mainWindow.webContents.openDevTools();
  mainWindow.on('close', function() {
    mainWindow = null;
  })
}

app.on('ready', () => createWindow())

app.on('window-all-closed', function () {
  app.quit()
})

app.on('active', function () {
  if (!mainWindow) {
    createWindow()
  }
})