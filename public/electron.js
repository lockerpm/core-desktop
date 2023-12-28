const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');
const isDev = require('electron-is-dev');
const url = require('url');

const { service } = require(path.join(__dirname, './service.js'));

app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

if (process.platform === 'win32' && process.argv.length >= 2) {
  app.setAsDefaultProtocolClient('locker-app', process.execPath, [path.resolve(process.argv[1])])
} else {
  app.setAsDefaultProtocolClient('locker-app')
}

let mainWindow;

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
  service.on('customMessageReceived', (data) => {
    mainWindow.webContents.send('event', 'customMessageReceived', data)
  })

  mainWindow.on('close', function () {
    mainWindow = null;
  })
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow.browserWindow) {
      if (mainWindow.browserWindow.isMinimized()) {
        mainWindow.browserWindow.restore()
      }
      mainWindow.browserWindow.focus()
    }
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

app.on('open-url', (event, url) => {
  dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
})

app.whenReady().then(() => {
  const wrapMethod = async (promise) => {
    try {
      const res = await promise
      return {
        success: true,
        res
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.toString(),
          code: error.code
        }
      }
    }
  }

  ipcMain.handle('setApiToken', (event, token) => {
    return service.setApiToken(token)
  })
  ipcMain.handle('getFidoDeviceList', () => {
    return wrapMethod(service.getFidoDeviceList())
  })
  ipcMain.handle(
    'getPasswordless', (event, params) => {
      return wrapMethod(service.getPasswordless(params))
    }
  )
  ipcMain.handle(
    'setNewPasswordless', (event, params) => {
      return wrapMethod(service.setNewPasswordless(params))
    }
  )
  ipcMain.handle(
    'login', (event, params) => {
      return wrapMethod(service.login(params))
    }
  )
  ipcMain.handle('lock', () => {
    return wrapMethod(service.lock())
  })
  ipcMain.handle('logout', () => {
    return wrapMethod(service.logout())
  })
  ipcMain.handle('getCurrentUser', () => {
    return wrapMethod(service.getCurrentUser())
  })
  ipcMain.handle('confirmPairingClient', (event, clientId) => {
    return wrapMethod(service.confirmPairingClient(clientId))
  })
  ipcMain.handle('resetPairingCode', (event, clientId) => {
    return wrapMethod(service.resetPairingCode(clientId))
  })
  ipcMain.handle('getServiceStatus', () => {
    return service.isReady
  })
  ipcMain.handle('setCacheData', (event, data) => {
    return wrapMethod(service.setCacheData(data))
  })
  ipcMain.handle('getCacheData', () => {
    return service.getCacheData()
  })
  ipcMain.handle('resetGRPC', () => {
    return service.resetGRPC()
  })
  ipcMain.handle('resetSocket', () => {
    return service.resetSocket()
  })
  ipcMain.handle('deleteBackupPasswordless', (e, id) => {
    return wrapMethod(service.deleteBackupPasswordless(id))
  })
  ipcMain.handle('listBackupPasswordless', () => {
    return wrapMethod(service.listBackupPasswordless())
  })
  ipcMain.handle(
    'setBackupPasswordless', (e, params) => {
      return wrapMethod(service.setBackupPasswordless(params))
    }
  )
  ipcMain.handle('openShellUrl', (__, url) => {
    shell.openExternal(url)
  })
})