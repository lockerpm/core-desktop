$serviceAlias = ""  # Set your service alias

# Initialize log file
$logFile = "install_log.txt"
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

Write-Log "Script started."

# Clean up existing certificates
try {
    Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -match 'LockerServiceCA' } | Remove-Item -Force
    Write-Log "Removed existing LockerServiceCA certificates."
} catch {
    Write-Log "Failed to remove LockerServiceCA certificates: $_"
}

try {
    Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -match 'LockerServiceServer' } | Remove-Item -Force
    Write-Log "Removed existing LockerServiceServer certificates."
} catch {
    Write-Log "Failed to remove LockerServiceServer certificates: $_"
}

$period = (Get-Date).AddYears(100)

# Create CA certificate
try {
    $ca = New-SelfSignedCertificate -Subject 'CN=LockerServiceCA,O=LockerServiceCA,OU=LockerServiceCA' `
        -CertStoreLocation cert:\LocalMachine\My -TextExtension @("2.5.29.19={text}CA=1") `
        -KeyExportPolicy Exportable -KeyUsage CertSign,CRLSign,DigitalSignature `
        -KeyLength 4096 -KeyUsageProperty All -KeyAlgorithm 'RSA' `
        -HashAlgorithm 'SHA256' -Provider 'Microsoft Enhanced RSA and AES Cryptographic Provider' `
        -FriendlyName locker_service_ca -NotAfter $period
    Write-Log "CA certificate created successfully."
} catch {
    Write-Log "Failed to create CA certificate: $_"
}

# Create server certificate
try {
    $server = New-SelfSignedCertificate -Subject 'CN=LockerServiceServer,O=LockerServiceServer,OU=LockerServiceServer' `
        -CertStoreLocation cert:\LocalMachine\My -TextExtension @("2.5.29.17={text}IPAddress=0.0.0.0&DNS=*.tls&DNS=localhost") `
        -Signer $ca -KeyUsage KeyEncipherment,DigitalSignature -KeyAlgorithm RSA -KeyLength 4096 `
        -HashAlgorithm "SHA256" -KeyExportPolicy Exportable -FriendlyName locker_service_server -NotAfter $period
    Write-Log "Server certificate created successfully."
} catch {
    Write-Log "Failed to create server certificate: $_"
}

# Create certificate directory if it does not exist
try {
    $certDir = "$current\cert"
    if (!(Test-Path $certDir)) {
        New-Item "$certDir" -ItemType Directory | Out-Null
    }
    Write-Log "Certificate directory created or already exists."
} catch {
    Write-Log "Failed to create certificate directory: $_"
}

# Export CA certificate to PEM file
try {
    $CaBase64 = [System.Convert]::ToBase64String($ca.RawData, [System.Base64FormattingOptions]::InsertLineBreaks)
    $CaPem = @"
-----BEGIN CERTIFICATE-----
$CaBase64
-----END CERTIFICATE-----
"@
    $CaPem | Out-File -Filepath "$certDir\ca-cert.pem" -Encoding Ascii
    Write-Log "CA certificate exported to PEM file."
} catch {
    Write-Log "Failed to export CA certificate: $_"
}

# Export server certificate to PEM file
try {
    $CertBase64 = [System.Convert]::ToBase64String($server.RawData, [System.Base64FormattingOptions]::InsertLineBreaks)
    $CertPem = @"
-----BEGIN CERTIFICATE-----
$CertBase64
-----END CERTIFICATE-----
"@
    $CertPem | Out-File -Filepath "$certDir\server-cert.pem" -Encoding Ascii
    Write-Log "Server certificate exported to PEM file."
} catch {
    Write-Log "Failed to export server certificate: $_"
}

# Export server private key to PEM file
try {
    $RSACng = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($server)
    $KeyBytes = $RSACng.Key.Export([System.Security.Cryptography.CngKeyBlobFormat]::Pkcs8PrivateBlob)
    $KeyBase64 = [System.Convert]::ToBase64String($KeyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
    $KeyPem = @"
-----BEGIN PRIVATE KEY-----
$KeyBase64
-----END PRIVATE KEY-----
"@
    $KeyPem | Out-File -Filepath "$certDir\server-key.pem" -Encoding Ascii
    Write-Log "Server private key exported to PEM file."
} catch {
    Write-Log "Failed to export server private key: $_"
}

# Setup service
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

try {
    & "$current\locker-service.exe" -service=install
    & "$current\locker-service.exe" -service=start 
    Write-Log "Locker service installed and started."
} catch {
    Write-Log "Failed to install or start locker service: $_"
}

if ($null -eq $WorkingPort) {
    $WorkingPort = $GatewayPorts[0]
    Write-Log "No existing service found. Using default port $WorkingPort."
}

$uri = "http://localhost:$WorkingPort/ping-locker-service"
try {
    $res = Invoke-WebRequest -Uri $uri -TimeoutSec 1 -ErrorAction Stop
    if ($res.StatusCode -eq 200) {
        Write-Log "Service started successfully on port $WorkingPort"
    } else {
        Write-Log "Service did not start successfully. Status code: $($res.StatusCode)"
    }
} catch {
    Write-Log "Service not started. Error: $_.Exception.Message"
}

Write-Log "Script completed."
