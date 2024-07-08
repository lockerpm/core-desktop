Required files for MacOS (arm64 and amd64) installer

https://gist.github.com/steve981cr/def310670dfd9ed1439bf31cc734f941

Generate icon
`iconutil -c icns icon.iconset`

To fix "CSSMERR_TP_CERT_REVOKED", check codesigning certificates
`security find-identity -p codesigning -v`
and remove the revoked one

Need to add entitlements to .mas.plist, refer to
- https://developer.apple.com/documentation/bundleresources/entitlements
- https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html (for app sandbox)