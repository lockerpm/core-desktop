const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('service', {
  setApiToken: (token) => ipcRenderer.invoke('setApiToken', token),
  getDeviceList: () => ipcRenderer.invoke('getDeviceList'),
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

  onEvent: (callback) => ipcRenderer.on('event', callback),
})
