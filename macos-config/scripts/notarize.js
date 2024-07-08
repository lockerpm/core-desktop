require('dotenv').config()
const { notarize } = require('@electron/notarize')
const path = require('path')

exports.default = async function notarizing(context) {
  // TODO: currently disable notarize
  return 
  
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appPath = path.join(
    appOutDir,
    `${context.packager.appInfo.productFilename}.app`
  )

  return await notarize({
    tool: 'notarytool',
    appBundleId: 'com.cystack.lockerpmapp',
    appPath,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID
  })
}