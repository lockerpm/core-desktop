import fs from 'fs'
import path from 'path'
import Store from 'electron-store'

require('dotenv').config()

import { StorageService, DesktopService } from "locker-desktop-service";

class MockStorageService implements StorageService {
  storage: Store
  constructor() {
    this.storage = new Store()
  }
  getSecure(key: string) {
    return Promise.resolve(this.storage.get(key) || null)
  }
  setSecure(key: string, data: any) {
    this.storage.set(key, data)
    return Promise.resolve()
  }
  deleteSecure(key: string) {
    this.storage.delete(key)
    return Promise.resolve()
  }
}
console.log(1111, process.env);
const storageService = new MockStorageService()
export const service = new DesktopService({
  baseApiUrl: `${process.env.REACT_APP_API_URL}/v3`,
  storageService,
  ssl: {
    rootCert: fs.readFileSync(path.resolve(__dirname, '../../cert/ca-cert.pem')),
  },
  logLevel: 2,
  unsafe: true,
}) 