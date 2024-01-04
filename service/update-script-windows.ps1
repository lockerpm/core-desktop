param (
   [string]$DownloadUrl = ""
)

$ErrorActionPreference = "Stop"
$execPath = (Get-CimInstance -ClassName win32_service | ?{$_.Name -match 'LockerPMService'} | Select PathName).PathName

try {
	&$execPath -service=stop
}
catch [System.Management.Automation.CommandNotFoundException] {}

try {
	Remove-Item -Force $execPath
}
catch [System.Management.Automation.ItemNotFoundException] {}

try {
        $res = Invoke-WebRequest -Uri $DownloadUrl -OutFile $execPath
	$res.StatusCode
}
catch {
	"An error occurred downloading the service:" 
	$_
}
if ($res.StatusCode -ne $null) {
	"An error occurred downloading the service:" 
	$_
	$res.StatusCode 
	$res.RawContent 
	exit 1	    
}

&$execPath -service=start

"Update Completed" 