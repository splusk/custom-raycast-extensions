#!/bin/bash
pritunl_client="/Applications/Pritunl.app/Contents/Resources/pritunl-client"

PROFILE_NAME=$1
PROFILE_ID=$($pritunl_client list | grep "($PROFILE_NAME)" | awk '{ print $2 }')

$pritunl_client stop ${PROFILE_ID}
echo "Disconnected"