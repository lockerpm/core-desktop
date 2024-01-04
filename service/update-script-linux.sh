#!/bin/bash
set -e
input=$(cat $(systemctl show -P FragmentPath LockerPMService.service) | grep ExecStart=)
execPath=$(echo $input | cut -d '=' -f 2)
rm -f $execPath.new
echo 'downloading service'
wget $1 -O $execPath.new
echo 'replacing service binary'
mv $execPath.new $execPath
echo 'setting service permission'
chmod +x $execPath
echo 'starting service'
$execPath -service=restart
echo "Update completed"