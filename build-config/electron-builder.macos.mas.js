
require('dotenv').config()

module.exports = {
  appId: 'io.locker.desktop',
  extraResources: [
    'cert',
    // 'locker-service'
  ],
  files: [
    'build/**/*',
    // 'node_modules/**/*',
    'package.json'
  ],
  mac: {
    publish: [
      {
        provider: "github",
        owner: "lockerpm",
        repo: "desktop-releases"
      }
    ],
    icon: '../macos-config/icon/icon.icns',
    category: 'public.app-category.utilities',
    hardenedRuntime: false,
    notarize: false,
    // notarize: {
    //   teamId: 'W7S57TNBH5'
    // },

    // ----- MAS distribution config ----
    entitlements: './macos-config/distribution/entitlements.mas.plist',
    entitlementsInherit: './macos-config/distribution/entitlements.mas.inherit.plist',
    provisioningProfile: './macos-config/distribution/Locker_Desktop_distribution.provisionprofile',
    target: [
      {
        target: 'mas',
        arch: [
          'universal',
        ],
      },
    ],

    // ----- MAS dev config ----
    // target: 'mas-dev',
    // type: 'development',
    // provisioningProfile: './macos-config/distribution/Locker_Desktop_development.provisionprofile',
    // entitlements: './macos-config/distribution/entitlements.mas.plist',
    // entitlementsInherit: './macos-config/distribution/entitlements.mas.inherit.plist',
  },
  pkg: {
    // scripts: '../macos-config/pkg-scripts'
  }
}