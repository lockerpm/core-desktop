#!/bin/bash

app_name="LockerPM"
service_alias=""

app_resources_path="/opt/$app_name/resources"
binary_path="$app_resources_path/locker-service"
cert_path="$app_resources_path/cert"

# List of ports
ports=(14411 14110 15611 14412 16311 14514 14515 14413 14401 14100 15601 14402 16301 14504 14505 14403)
echo "Checking existing background service on: ${ports[@]}"

# Flag to track if any port responded
responded=false

# Iterate over each port
for port in "${ports[@]}"; do
    # Send a GET request to localhost:port/ping-locker-service
    response=$(curl -s "http://localhost:$port/ping-locker-service")
    message=$(echo $response | grep -o '"message":[^,}]*' | sed 's/"message":"\([^"]*\)".*/\1/')
    alias=$(echo $response | grep -o '"alias":[^,}]*' | sed 's/"alias":"\([^"]*\)".*/\1/')

    echo "Port $port response with: $response"
    echo "Message: $message - Alias: $alias"

    # Check if the response message is "pong" and have the same alias
    if [ "$alias" == "$service_alias" ] && [ "$message" == "pong" ]; then
        echo "Found running service on $port"
        responded=true
        break  # Exit the loop if any port matches
    fi
done

# Check if any port responded -> uninstall service
if [ "$responded" = true ]; then
    echo "Service is currently running" 
    sudo "$binary_path" -service=stop
    sudo "$binary_path" -service=uninstall
    echo "Current service is uninstalled" 
else
    echo "Service is not running" 
fi

echo "Removing certs"
rm -rf "$cert_path"

echo "end" 

exit 0
