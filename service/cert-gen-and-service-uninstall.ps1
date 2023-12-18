#stop and uninstall service
$GatewayPorts = @("14401", "14100", "15601", "14402", "16301", "14504", "14505", "14403")
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
	.\desktop-service.exe -service=stop
	.\desktop-service.exe -service=uninstall   
    }
}

# clean up cert store
Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -match 'LockerServiceCA' } | Remove-Item
Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -match 'LockerServiceServer' } | Remove-Item