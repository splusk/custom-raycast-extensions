#!/bin/bash
pritunl_client="/Applications/Pritunl.app/Contents/Resources/pritunl-client"

PIN=$1
OTP=$2
PROFILE_NAME=$3
PROFILE_ID=$($pritunl_client list | grep "($PROFILE_NAME)" | awk '{ print $2 }')

$pritunl_client start ${PROFILE_ID} --password "${PIN}${OTP}"
echo "Connected"