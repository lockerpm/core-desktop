const fs = require('fs')
const path = require('node:path');
const Store = require('electron-store');
const isDev = require('electron-is-dev');
const os = require('os')
const constants = require('./constants.json')

isDev && require('dotenv').config()

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
  const platform = os.platform()
  let devPath = '../service/cert/ca-cert.pem'
  let prodPath = '../cert/ca-cert.pem'
  if (platform === 'darwin') {
    devPath = '../cert/ca-cert.pem'
    prodPath = './cert/ca-cert.pem'
  }
  if (isDev) {
    return fs.readFileSync(path.join(__dirname, devPath))
  } else {
    return fs.readFileSync(path.resolve(process.resourcesPath, prodPath))
  }
})()


const storageService = new MockStorageService()
const service = new DesktopService({
  baseApiUrl: `${process.env.REACT_APP_API_URL || constants.REACT_APP_API_URL}/v3`,
  storageService,
  ssl: {
    rootCert: rootCert,
  },
  logLevel: 1,
  unsafe: true,
  servicePorts: [16310, 15610, 14510, 14511, 14410, 14610, 14512, 14513]
})

module.exports = {
  service
}