module.exports = {
  appId: 'com.lockerpm_app',
  extraResources: ['cert', 'locker-service', 'service-config.json'],
  files: ['build/**/*'],
  // afterSign: 'macos-config/scripts/notarize.js',
  mac: {
    target: [
      {
        target: 'pkg',
        arch: [
          'x64',
          'arm64'
        ],
      },
    ],
    publish: [
      {
        provider: 'github',
        owner: 'lockerpm',
        repo: 'desktop-releases',
      },
    ],
    icon: '../macos-config/icon/icon.icns',
    category: 'public.app-category.utilities',
    hardenedRuntime: true,
    entitlements: './macos-config/distribution/entitlements.mac.plist',
    entitlementsInherit: './macos-config/distribution/entitlements.mac.plist',
    notarize: false,
  },
  pkg: {
    scripts: '../macos-config/pkg-scripts',
  },
}