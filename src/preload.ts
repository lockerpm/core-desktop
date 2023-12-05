import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('service', {
  setApiToken: (token: string) => ipcRenderer.invoke('setApiToken', token),
  getDeviceList: () => ipcRenderer.invoke('getDeviceList'),
  getPasswordless: (params: {
    email: string
    pin?: string
    devicePath: string
    onlyBackup?: boolean
  }) => ipcRenderer.invoke('getPasswordless', params),
  setNewPasswordless: (params: { devicePath: string; email: string; name: string; pin?: string }) =>
    ipcRenderer.invoke('setNewPasswordless', params),
  login: (params: { email: string; key: string; hashedPassword: string }) =>
    ipcRenderer.invoke('login', params),
  logout: () => ipcRenderer.invoke('logout'),
  getCurrentUser: () => ipcRenderer.invoke('getCurrentUser'),
  confirmPairingClient: (clientId: string, clientType: 'web' | 'extension') =>
    ipcRenderer.invoke('confirmPairingClient', clientId, clientType),
  resetPairingCode: (clientId: string) => ipcRenderer.invoke('resetPairingCode', clientId),
  getServiceStatus: () => ipcRenderer.invoke('getServiceStatus'),
  resetGRPC: () => ipcRenderer.invoke('resetGRPC'),
  resetSocket: () => ipcRenderer.invoke('resetSocket'),
  deleteBackupPasswordless: (id: string) => ipcRenderer.invoke('deleteBackupPasswordless', id),
  listBackupPasswordless: () => ipcRenderer.invoke('listBackupPasswordless'),
  setBackupPasswordless: (params: {
    deviceName: string
    devicePath: string
    email: string
    name: string
    currentEncKey: ArrayBuffer
    pin?: string
  }) => ipcRenderer.invoke('setBackupPasswordless', params),

  onEvent: (callback: any) => ipcRenderer.on('event', callback),
})
