const fs = require('fs')
const path = require('node:path');
const Store = require('electron-store');

require('dotenv').config()

const { DesktopService } = require('locker-desktop-service')

class MockStorageService  {
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
const storageService = new MockStorageService()
const service = new DesktopService({
  baseApiUrl: `${process.env.REACT_APP_API_URL}/v3`,
  storageService,
  ssl: {
    rootCert: fs.readFileSync(path.resolve(__dirname, '../ca-cert.pem')),
  },
  logLevel: 2,
  unsafe: true,
})

module.exports = {
  service
}