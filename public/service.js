const fs = require('fs')
const path = require('node:path');
const Store = require('electron-store');
const isDev = require('electron-is-dev');

const { DesktopService } = require('locker-desktop-service')

class MockStorageService {
  storage
  constructor() {
    this.storage = new Store()
  }
  getSecure(key) {
    return Promise.resolve(this.storage.get(key) || null)
  }
  setSecure(key, data) {
    this.storage.set(key, data)
    return Promise.resolve()
  }
  deleteSecure(key) {
    this.storage.delete(key)
    return Promise.resolve()
  }
}

const rootCert = (() => {
  if (isDev) {
    return fs.readFileSync(path.join(__dirname, '../cert/ca-cert.pem'))
  } else {
    return fs.readFileSync(path.resolve(process.resourcesPath, 'cert', 'ca-cert.pem'))
  }
})()

const storageService = new MockStorageService()
const service = new DesktopService({
  baseApiUrl: 'https://api.cystack.net/v3',
  storageService,
  ssl: {
    rootCert: rootCert,
  },
  logLevel: 1,
  unsafe: true
})

module.exports = {
  service
}
