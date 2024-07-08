$serviceAlias = ""

# Initialize log file
$logFile = "uninstall_log.txt"
$current = Get-Location
$logFilePath = "$current\$logFile"

# Check if the log file exists and clear it, or create it if it doesn't exist
if (Test-Path -Path $logFilePath) {
    Clear-Content -Path $logFilePath -Force
} else {
    New-Item -Path $logFilePath -ItemType File | Out-Null
}

function Write-Log {
    param (
        [string]$message
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp - $message"
    Write-Host $logMessage
    $logMessage | Out-File -FilePath $logFilePath -Append -Encoding Ascii
}

#stop and uninstall service
$GatewayPorts = @("14411", "14110", "15611", "14412", "16311", "14514", "14515", "14413", "14401", "14100", "15601", "14402", "16301", "14504", "14505", "14403")
$WorkingPort = $null

foreach ($port in $GatewayPorts) {
    Write-Log "Pinging port $port"
    $uri = "http://localhost:$port/ping-locker-service"
    try {
        $res = Invoke-WebRequest -Uri $uri -TimeoutSec 1 -ErrorAction Stop
        if ($res.StatusCode -eq 200) {
            $jsonObject = $res.Content | ConvertFrom-Json
            Write-Log "Found response on port $port => $jsonObject"
            if ($jsonObject.message -eq "pong" -and $jsonObject.alias -eq $serviceAlias) {
                $WorkingPort = $port
                & "$current\locker-service.exe" -service=stop
                & "$current\locker-service.exe" -service=uninstall 
                Write-Log "Found existing locker service on port $port. Service stopped and uninstalled."
                break
            }
        }
    } catch {
        # Do nothing, just continue to the next port
        Write-Log "Ping port $port failed"
    }
} 

# clean up cert store
Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -match 'LockerServiceCA' } | Remove-Item
Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -match 'LockerServiceServer' } | Remove-Item