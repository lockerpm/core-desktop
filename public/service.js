const fs = require('fs')
const path = require('node:path');
// const Store = require('electron-store');
const isDev = require('electron-is-dev');
const os = require('os')
const constants = require('./constants.json')

isDev && require('dotenv').config()

const { DesktopService } = require('@lockerpm/desktop-service')

class MockStorageService {
  storage
  constructor() {
    // TODO: electron-store is unsafe in app-level
    this.storage = new Map()
    // this.storage = new Store()
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

const getCert = (name) => {
  const platform = os.platform()
  let devPath = '../service/cert/'
  let prodPath = '../cert/'
  if (['darwin', 'linux'].includes(platform)) {
    devPath = '../cert/'
    prodPath = './cert/'
  }
  if (isDev) {
    return fs.readFileSync(path.join(__dirname, devPath + name))
  } else {
    return fs.readFileSync(path.resolve(process.resourcesPath, prodPath + name))
  }
}

const storageService = new MockStorageService()
const service = new DesktopService({
  baseApiUrl: `${process.env.REACT_APP_API_URL || constants.REACT_APP_API_URL}/v3`,
  storageService,
  ssl: {
    rootCert: getCert('ca-cert.pem'),
  },
  socketSsl: {
    cert: getCert('server-cert.pem'),
    key: getCert('server-key.pem'),
  },
  logLevel: 1,
  unsafe: true,
  apiHeaders: {
    'CF-Access-Client-Id': process.env.REACT_APP_CF_ACCESS_CLIENT_ID || constants.REACT_APP_CF_ACCESS_CLIENT_ID,
    'CF-Access-Client-Secret': process.env.REACT_APP_CF_ACCESS_CLIENT_SECRET || constants.REACT_APP_CF_ACCESS_CLIENT_SECRET,
  }
})

module.exports = {
  service
}