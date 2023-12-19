#stop and uninstall service
$GatewayPorts = @("14411", "14110", "15611", "14412", "16311", "14514", "14515", "14413")
$WorkingPort = $null
for ($i=0; $i -lt $GatewayPorts.Length; $i++) {
    # Commands to execute for each item in the array
    $uri = "http://localhost:" + $GatewayPorts[$i] + "/ping-locker-service"
    try {
        $res = Invoke-WebRequest -Uri $uri
    }
    catch {
	$res = $null
    }
    if ($res.StatusCode -eq "200") {
	$WorkingPort = $GatewayPorts[$i]
	.\locker_service.exe -service=stop
	.\locker_service.exe -service=uninstall   
    }
}

# clean up cert store
Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -match 'LockerServiceCA' } | Remove-Item
Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -match 'LockerServiceServer' } | Remove-Item