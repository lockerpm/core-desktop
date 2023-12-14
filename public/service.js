const fs = require('fs')
const path = require('node:path');
const Store = require('electron-store');
const isDev = require('electron-is-dev');

require('dotenv').config()

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
  return fs.readFileSync(path.join(__dirname, '../service/cert/ca-cert.pem'))
})()

const storageService = new MockStorageService()
const service = new DesktopService({
  baseApiUrl: `${process.env.REACT_APP_API_URL}/v3`,
  storageService,
  ssl: {
    rootCert: rootCert,
  },
  logLevel: 1,
  unsafe: true,
  apiHeaders: {
    'CF-Access-Client-Id': process.env.REACT_APP_CF_ACCESS_CLIENT_ID,
    'CF-Access-Client-Secret': process.env.REACT_APP_CF_ACCESS_CLIENT_SECRET,
  }
})

module.exports = {
  service
}