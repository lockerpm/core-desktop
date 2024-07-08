module.exports = {
  appId: 'com.lockerpm_app',

  // Must use name without space for linux
  productName: 'LockerPM',

  extraResources: ['cert', 'locker-service', 'service-config.json'],
  files: ['build/**/*'],
  linux: {
    publish: [
      {
        provider: "github",
        owner: "lockerpm",
        repo: "desktop-releases"
      }
    ],
    // publish: null,
    target: [
      'deb',
      'rpm'
    ],
    icon: '../macos-config/icon/icon.icns',
    desktop: {      
      'Name': 'Locker Password Manager'   // Return its original name here
    },
    category: 'Utility'
  },
  deb: {
    depends: ["libnotify4", "libxtst6", "libnss3"],
    afterInstall: './linux-config/postinstall.tpl',
    fpm: ['--before-remove=linux-config/preremove.sh']
  },
  rpm: {
    afterInstall: './linux-config/postinstall.tpl',
    // fpm: ['--before-remove=linux-config/preremove.sh']
  }
}
