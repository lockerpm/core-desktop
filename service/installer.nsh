RequestExecutionLevel admin

!macro customInstall
  SetOutPath $INSTDIR
  nsExec::Exec /OEM "powershell -ExecutionPolicy Bypass .\cert-gen-and-service-install.ps1"
  Pop $0
!macroend

!macro customRemoveFiles
  SetOutPath $INSTDIR
  nsExec::Exec /OEM "powershell -ExecutionPolicy Bypass .\cert-gen-and-service-uninstall.ps1"
  Pop $0
  RMDir /r $INSTDIR
!macroend

