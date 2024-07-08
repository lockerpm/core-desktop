#!/bin/bash

app_name='${sanitizedProductName}'
service_alias=""

# --------------- DEFAULT ELECTRON-BUILD SCRIPTS ---------------

if type update-alternatives 2>/dev/null >&1; then
    # Remove previous link if it doesn't use update-alternatives
    if [ -L '/usr/bin/${executable}' -a -e '/usr/bin/${executable}' -a "`readlink '/usr/bin/${executable}'`" != '/etc/alternatives/${executable}' ]; then
        rm -f '/usr/bin/${executable}'
    fi
    update-alternatives --install '/usr/bin/${executable}' '${executable}' '/opt/${sanitizedProductName}/${executable}' 100 || ln -sf '/opt/${sanitizedProductName}/${executable}' '/usr/bin/${executable}'
else
    ln -sf '/opt/${sanitizedProductName}/${executable}' '/usr/bin/${executable}'
fi

# SUID chrome-sandbox for Electron 5+
chmod 4755 '/opt/${sanitizedProductName}/chrome-sandbox' || true

if hash update-mime-database 2>/dev/null; then
    update-mime-database /usr/share/mime || true
fi

if hash update-desktop-database 2>/dev/null; then
    update-desktop-database /usr/share/applications || true
fi

# --------------- OUR SCRIPTS ---------------

output_file="/tmp/locker-postinstall-log.txt"

if [ -e "$output_file" ]; then
    rm "$output_file"
fi

# Current time
echo "Current time: $(date +"%T")" > "$output_file"

# Current folder
pwd >> "$output_file"
echo "Param 0: $0" >> "$output_file"
echo "Param 1: $1" >> "$output_file"

echo "Installer version 0.1.0" >> "$output_file"
echo "App name: $app_name" >> "$output_file"

app_resources_path="/opt/$app_name/resources"
binary_path="$app_resources_path/locker-service"
cert_path="$app_resources_path/cert"

### CREATE CERTS

cd "$cert_path"

if command -v openssl &> /dev/null; then
    echo "OpenSSL is installed." >> "$output_file"
    rm *.pem
    rm *.srl
    rm *.cnf
else
    echo "OpenSSL is not installed." >> "$output_file"
fi

# 1. Generate CA's private key and self-signed certificate
openssl req -x509 -newkey rsa:4096 -days 36500 -nodes -keyout ca-key.pem -out ca-cert.pem -subj "/C=VN/ST=Hanoi/L=Hanoi/O=CyStack.JSC/ou=Enterprise/cn=*.cystack.net/emailaddress=contact@cystack.net"

echo "CA's self-signed certificate" >> "$output_file"
openssl x509 -in ca-cert.pem -noout -text

# 2. Generate web server's private key and certificate signing request (CSR)
openssl req -newkey rsa:4096 -nodes -keyout server-key.pem -out server-req.pem -subj "/C=FR/ST=Ile de France/L=Paris/O=Server tls/ou=server/cn=*.tls/emailaddress=tls@gmail.com"

# Remember that when we develop on localhost, It’s important to add the IP:0.tcp.in.ngrok.io as an Subject Alternative Name (SAN) extension to the certificate.
echo "subjectAltName=DNS:*.tls,DNS:localhost,IP:0.0.0.0" > server-ext.cnf
# Or you can use localhost DNS and grpc.ssl_target_name_override variable
# echo "subjectAltName=DNS:localhost" > server-ext.cnf

# 3. Use CA's private key to sign web server's CSR and get back the signed certificate
openssl x509 -req -in server-req.pem -days 36500 -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -extfile server-ext.cnf

echo "Server's signed certificate" >> "$output_file"
openssl x509 -in server-cert.pem -noout -text

# Change ownership back to current user
chown $SUDO_USER ca-cert.pem
chown $SUDO_USER server-cert.pem
chown $SUDO_USER server-key.pem

# List of ports
ports=(14411 14110 15611 14412 16311 14514 14515 14413 14401 14100 15601 14402 16301 14504 14505 14403)
echo "Checking existing background service on: ${ports[@]}" >> "$output_file"

# Flag to track if any port responded
responded=false

# Iterate over each port
for port in "${ports[@]}"; do
    # Send a GET request to localhost:port/ping-locker-service
    response=$(curl -s "http://localhost:$port/ping-locker-service")
    message=$(echo $response | grep -o '"message":[^,}]*' | sed 's/"message":"\([^"]*\)".*/\1/')
    alias=$(echo $response | grep -o '"alias":[^,}]*' | sed 's/"alias":"\([^"]*\)".*/\1/')

    echo "Port $port response with: $response" >> "$output_file"
    echo "Message: $message - Alias: $alias" >> "$output_file"

    # Check if the response message is "pong" and have the same alias
    if [ "$alias" == "$service_alias" ] && [ "$message" == "pong" ]; then
        echo "Found running service on $port" >> "$output_file"
        responded=true
        break  # Exit the loop if any port matches
    fi
done

# Check if any port responded -> uninstall service
if [ "$responded" = true ]; then
    echo "Service is currently running" >> "$output_file"
    sudo "$binary_path" -service=stop
    sudo "$binary_path" -service=uninstall
    echo "Current service is uninstalled" >> "$output_file"
else
    echo "Service is not running" >> "$output_file"
fi

# Start service
sudo "$binary_path" -service=install
sudo "$binary_path" -service=start
echo "Service is started" >> "$output_file"

echo "end" >> "$output_file"

exit 0
