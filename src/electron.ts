import { app, BrowserWindow, ipcMain } from 'electron'
import { service } from './service'
const path = require('node:path');
const isDev = require('electron-is-dev');
const url = require('url');

declare const LOCKER_PASSWORD_MANAGER_WEBPACK_ENTRY: string
declare const LOCKER_PASSWORD_MANAGER_PRELOAD_WEBPACK_ENTRY: string

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: LOCKER_PASSWORD_MANAGER_PRELOAD_WEBPACK_ENTRY,
    }
  })

  mainWindow.loadURL(LOCKER_PASSWORD_MANAGER_WEBPACK_ENTRY);

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
  service.on('userLogout', (data) => {
    mainWindow.webContents.send('event', 'userLogout', data)
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  ipcMain.handle('setApiToken', (event, token) => {
    return service.setApiToken(token)
  })
  ipcMain.handle('getDeviceList', () => {
    return service.getFidoDeviceList()
  })
  ipcMain.handle(
    'getPasswordless',
    (event, params: { email: string; pin?: string; devicePath: string; onlyBackup?: boolean }) => {
      return service.getPasswordless(params)
    }
  )
  ipcMain.handle(
    'setNewPasswordless',
    (event, params: { devicePath: string; email: string; name: string; pin?: string }) => {
      return service.setNewPasswordless(params)
    }
  )
  ipcMain.handle(
    'login',
    (event, params: { email: string; key: string; hashedPassword: string }) => {
      return service.login(params)
    }
  )
  ipcMain.handle('logout', () => {
    return service.logout()
  })
  ipcMain.handle('getCurrentUser', () => {
    return service.getCurrentUser()
  })
  ipcMain.handle(
    'confirmPairingClient',
    (event, clientId: string, clientType: 'web' | 'extension') => {
      return service.confirmPairingClient(clientId, clientType)
    }
  )
  ipcMain.handle('resetPairingCode', (event, clientId: string) => {
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
  ipcMain.handle('deleteBackupPasswordless', (e, id: string) => {
    return service.deleteBackupPasswordless(id)
  })
  ipcMain.handle('listBackupPasswordless', () => {
    return service.listBackupPasswordless()
  })
  ipcMain.handle(
    'setBackupPasswordless',
    (
      e,
      params: {
        deviceName: string
        devicePath: string
        email: string
        name: string
        currentEncKey: ArrayBuffer
        pin?: string
      }
    ) => {
      return service.setBackupPasswordless(params)
    }
  )
})
