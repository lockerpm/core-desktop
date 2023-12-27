const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('service', {
  setApiToken: (token) => ipcRenderer.invoke('setApiToken', token),
  getFidoDeviceList: () => unwrapMethod(ipcRenderer.invoke('getFidoDeviceList')),
  getPasswordless: (params) =>
    unwrapMethod(ipcRenderer.invoke('getPasswordless', params)),
  setNewPasswordless: (params) =>
    unwrapMethod(ipcRenderer.invoke('setNewPasswordless', params)),
  login: (params) =>
    unwrapMethod(ipcRenderer.invoke('login', params)),
  lock: () => unwrapMethod(ipcRenderer.invoke('lock')),
  logout: () => unwrapMethod(ipcRenderer.invoke('logout')),
  getCurrentUser: () => unwrapMethod(ipcRenderer.invoke('getCurrentUser')),
  confirmPairingClient: (clientId) => unwrapMethod(ipcRenderer.invoke('confirmPairingClient', clientId)),
  resetPairingCode: (clientId) => unwrapMethod(ipcRenderer.invoke('resetPairingCode', clientId)),
  getServiceStatus: () => ipcRenderer.invoke('getServiceStatus'),

  resetGRPC: () => ipcRenderer.invoke('resetGRPC'),
  resetSocket: () => ipcRenderer.invoke('resetSocket'),
  deleteBackupPasswordless: (id) => unwrapMethod(ipcRenderer.invoke('deleteBackupPasswordless', id)),
  listBackupPasswordless: () => unwrapMethod(ipcRenderer.invoke('listBackupPasswordless')),
  setBackupPasswordless: (params) => unwrapMethod(ipcRenderer.invoke('setBackupPasswordless', params)),

  openShellUrl: url => ipcRenderer.invoke('openShellUrl', url),
  onEvent: (callback) => ipcRenderer.on('event', callback),
})

const unwrapMethod = async (promise) => {
  const res = await promise
  if (!res.success) {
    throw { code: res.error.code, message: res.error.message }
  }
  return res.res
}
