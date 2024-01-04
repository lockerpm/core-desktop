# Locker Desktop Self-hosted

Locker Desktop app, but self-hosted. This app including the main app and a background service. The expected output is an installer that can install both the app and the background service.

## Development

This is an Electron app
- Install with `yarn`
- Pull submodule with `yarn sub:init`
- Create a `.env` file, refer to `.env.example`
- Start the backgroud service manually or use the existing Locker app's background service, copy the file `ca-cert.pem` into `/cert` (for macos) and `/service/cert` (for windows)
- Edit `/public/service.js` if needed, for example, changing `logLevel` or set `servicePorts`
- In development environment, you will start a web app using `craco`, running at `https://demo.locker.io:3002`, and use electron to render the content of this url. To start both at once, simply run `yarn start`, or if you would like to have more control, use `yarn start-web` and `yarn start-desktop`
- Make sure that you pointed `demo.locker.io` to `localhost` in your hosts file
- To push code without triggering CI/CD, use `git push -o ci.skip`

## Build

- You can find `electron-build` configuration file for each platform in `/build-config`, you can change `appId` here.
- If you build locally without CI/CD, update `/public/constants.json` with values from `.env`, just remember to checkout them before `git commit`.
- Update `productName`in `package.json`
- Update app name inside `<title></title>` in `/public/index.html`
- Get the `sha256` in `hex` format of the `locker-service` file to submit checksum later

### MacOS
`/macos-config` keep all mac-related config
- Put the correct build (x64 or arm64) of `locker-service` in the project root
- Change `icon.icns` with the correct icon
- In `pkg-scripts/postinstall`, update `app_name` and `use_their_ports`
- `yarn release:mac` then find the `.pkg` file in `dist`
- Get the path of the file in `dist/mac-arm64` or `dist/mac`, then run `codesign -dv --verbose=4 {filepath}`, then find the value of `CDHash`
- Submit the `CDHash` and checksum of service above to API

### Windows
`/service` keep all windows-related config (Note: I did not rename it to `/windows-config` for safety reasons)
- Put the correct build of `locker-service.exe` in `/service`
- Change `icon.ico` with the correct icon
- `yarn release:win-64`