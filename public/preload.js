const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('service', {
  setApiToken: (token) => ipcRenderer.invoke('setApiToken', token),
  getFidoDeviceList: () => ipcRenderer.invoke('getFidoDeviceList'),
  getPasswordless: (params) =>
    ipcRenderer.invoke('getPasswordless', params),
  setNewPasswordless: (params) =>
    ipcRenderer.invoke('setNewPasswordless', params),
  login: (params) =>
    ipcRenderer.invoke('login', params),
  logout: () => ipcRenderer.invoke('logout'),
  getCurrentUser: () => ipcRenderer.invoke('getCurrentUser'),
  confirmPairingClient: (clientId) => ipcRenderer.invoke('confirmPairingClient', clientId),
  resetPairingCode: (clientId) => ipcRenderer.invoke('resetPairingCode', clientId),
  getServiceStatus: () => ipcRenderer.invoke('getServiceStatus'),

  resetGRPC: () => ipcRenderer.invoke('resetGRPC'),
  resetSocket: () => ipcRenderer.invoke('resetSocket'),
  deleteBackupPasswordless: (id) => ipcRenderer.invoke('deleteBackupPasswordless', id),
  listBackupPasswordless: () => ipcRenderer.invoke('listBackupPasswordless'),
  setBackupPasswordless: (params) => ipcRenderer.invoke('setBackupPasswordless', params),

  onEvent: (callback) => ipcRenderer.on('event', callback),
})
