#!/bin/bash
pritunl_client="/Applications/Pritunl.app/Contents/Resources/pritunl-client"

URI="$1"
PROFILE_NAME=$2
PROFILE_ID=$($pritunl_client list | grep "($PROFILE_NAME)" | awk '{ print $2 }')

URI="$1"

if [[ -z $PROFILE_ID ]]; then
  echo "No profile found"
  echo "Trying to import profile"
  $pritunl_client add "$URI"
  PROFILE_ID=$($pritunl_client list | grep "($PROFILE_NAME)" | awk '{ print $2 }')
  if [[ -z $PROFILE_ID ]]; then
    exit 1
  fi
fi