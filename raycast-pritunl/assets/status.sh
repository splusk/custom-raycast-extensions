#!/bin/bash

pritunl_client="/Applications/Pritunl.app/Contents/Resources/pritunl-client"
PROFILE_NAME=$1
SOME_EARLIER_VERSION="1.3.3484.0"
CURRENT_CLIENT_VERSION=$($pritunl_client version | awk '{ print $3 }' | cut -c2-)
CONNECTION_STATUS="Unknown"

if (( $(echo "$CURRENT_CLIENT_VERSION $SOME_EARLIER_VERSION" | awk '{print ($1 > $2)}') )); then
    CONNECTION_STATUS=$($pritunl_client list | grep "($PROFILE_NAME)" | awk '{ print $11, $12 }' | tr -d '|')
else
    CONNECTION_STATUS=$($pritunl_client list | grep "($PROFILE_NAME)" | awk '{ print $7, $8 }' | tr -d '|')
fi

echo "$CONNECTION_STATUS"

