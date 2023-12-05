import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'

import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

const Dotenv = require('dotenv-webpack');

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new Dotenv({ config: {"path":"./.env", prefix:"process.env."}}),
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      port: 3000,
      loggerPort: 9001,
      //@ts-ignore
      mainConfig,
      devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
      renderer: {
        //@ts-ignore
        config: rendererConfig,
        entryPoints: [
          {
            html: './public/index.html',
            js: './src/renderer.ts',
            name: 'locker_password_manager',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
  ],
}

export default config
