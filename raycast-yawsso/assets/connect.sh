#!/bin/sh
export PATH="$PATH:/opt/homebrew/bin"
PROFILE=$1
echo `yawsso auto -e --profile "$PROFILE" | yawsso decrypt`