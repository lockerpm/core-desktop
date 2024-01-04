# clean up if exist
Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -match 'LockerServiceCA' } | Remove-Item
Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -match 'LockerServiceServer' } | Remove-Item

$period = (Get-Date).AddYears(100)

$ca = New-SelfSignedCertificate -Subject 'CN=LockerServiceCA,O=LockerServiceCA,OU=LockerServiceCA' -CertStoreLocation cert:\LocalMachine\My -TextExtension @("2.5.29.19={text}CA=1") -KeyExportPolicy Exportable  -KeyUsage CertSign,CRLSign,DigitalSignature -KeyLength 4096 -KeyUsageProperty All -KeyAlgorithm 'RSA'  -HashAlgorithm 'SHA256'  -Provider 'Microsoft Enhanced RSA and AES Cryptographic Provider' -FriendlyName locker_service_ca -NotAfter $period
$server = New-SelfSignedCertificate -Subject 'CN=LockerServiceServer,O=LockerServiceServer,OU=LockerServiceServer' -CertStoreLocation cert:\LocalMachine\My -TextExtension @("2.5.29.17={text}IPAddress=0.0.0.0&DNS=*.tls&DNS=localhost") -Signer $ca -KeyUsage KeyEncipherment,DigitalSignature -KeyAlgorithm RSA -KeyLength 4096 -HashAlgorithm "SHA256" -KeyExportPolicy Exportable -FriendlyName locker_service_server -NotAfter $period
$current = Get-Location
$certDir = "$current\cert"
if (!(Test-Path $certDir)) {
    #PowerShell Create directory if not exists
    [void](New-Item "$certDir" -ItemType Directory)
}

# ca-cert.pem
$CaBase64 = [System.Convert]::ToBase64String($ca.RawData, [System.Base64FormattingOptions]::InsertLineBreaks)
$CaPem = @"
-----BEGIN CERTIFICATE-----
$CaBase64
-----END CERTIFICATE-----
"@
$CaPem | Out-File -Filepath $certDir\ca-cert.pem -Encoding Ascii

# server-cert.pem
$CertBase64 = [System.Convert]::ToBase64String($server.RawData, [System.Base64FormattingOptions]::InsertLineBreaks)
$CertPem = @"
-----BEGIN CERTIFICATE-----
$CertBase64
-----END CERTIFICATE-----
"@
$CertPem | Out-File -Filepath $certDir\server-cert.pem -Encoding Ascii

# server-key.pem
$RSACng = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($server)
$KeyBytes = $RSACng.Key.Export([System.Security.Cryptography.CngKeyBlobFormat]::Pkcs8PrivateBlob)
$KeyBase64 = [System.Convert]::ToBase64String($KeyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
$KeyPem = @"
-----BEGIN PRIVATE KEY-----
$KeyBase64
-----END PRIVATE KEY-----
"@
$KeyPem | Out-File -Filepath $certDir\server-key.pem -Encoding Ascii

# setup service
# setup service
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
	.\locker-service.exe -service=stop
	.\locker-service.exe -service=uninstall
	break	    
    }
}

.\locker-service.exe -service=install
.\locker-service.exe -service=start

if ($WorkingPort -eq $null) {
    $WorkingPort = "14401"
}

$uri = "http://localhost:" + $WorkingPort + "/ping-locker-service"
try {
    $res = Invoke-WebRequest -Uri $uri
}
catch {
    Write-Host "service not started"
    Write-Host $_
}
if ($res.StatusCode -eq "200") {
    Write-Host "service started"
}