const { app , BrowserWindow, ipcMain  } = require('electron');
const path = require('node:path');
const isDev = require('electron-is-dev');
const url = require('url');

const { service } = require(path.join(__dirname, './service.js'));

app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

let mainWindow ;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, './preload.js'),
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

  // Setup service listener
  service.on('serviceReady', () => {
    mainWindow.webContents.send('event', 'serviceReady')
  })
  service.on('fidoRequestFingerprint', () => {
    mainWindow.webContents.send('event', 'fidoRequestFingerprint')
  })
  service.on('fidoRequestTouch', () => {
    mainWindow.webContents.send('event', 'fidoRequestTouch')
  })
  service.on('pairingConfirmation', (data) => {
    mainWindow.webContents.send('event', 'pairingConfirmation', data)
  })
  service.on('userLogin', (data) => {
    mainWindow.webContents.send('event', 'userLogin', data)
  })
  service.on('userLock', (data) => {
    mainWindow.webContents.send('event', 'userLock', data)
  })
  service.on('userLogout', (data) => {
    mainWindow.webContents.send('event', 'userLogout', data)
  })

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

app.on('activate', function () {
  if (!mainWindow) {
    createWindow()
  }
})

app.whenReady().then(() => {
  ipcMain.handle('setApiToken', (event, token) => {
    return service.setApiToken(token)
  })
  ipcMain.handle('getFidoDeviceList', () => {
    return service.getFidoDeviceList()
  })
  ipcMain.handle(
    'getPasswordless', (event, params ) => {
      return service.getPasswordless(params)
    }
  )
  ipcMain.handle(
    'setNewPasswordless', (event, params) => {
      return service.setNewPasswordless(params)
    }
  )
  ipcMain.handle(
    'login', (event, params) => {
      return service.login(params)
    }
  )
  ipcMain.handle('lock', () => {
    return service.lock()
  })
  ipcMain.handle('logout', () => {
    return service.logout()
  })
  ipcMain.handle('getCurrentUser', () => {
    return service.getCurrentUser()
  })
  ipcMain.handle('confirmPairingClient', (event, clientId) => {
    return service.confirmPairingClient(clientId)
  })
  ipcMain.handle('resetPairingCode', (event, clientId) => {
    return service.resetPairingCode(clientId)
  })
  ipcMain.handle('getServiceStatus', () => {
    return service.isReady
  })
  ipcMain.handle('resetGRPC', () => {
    return service.resetGRPC()
  })
  ipcMain.handle('resetSocket', () => {
    return service.resetSocket()
  })
  ipcMain.handle('deleteBackupPasswordless', (e, id) => {
    return service.deleteBackupPasswordless(id)
  })
  ipcMain.handle('listBackupPasswordless', () => {
    return service.listBackupPasswordless()
  })
  ipcMain.handle(
    'setBackupPasswordless', ( e, params ) => {
      return service.setBackupPasswordless(params)
    }
  )
})