#!/bin/bash

CONTENTS=$1
KEY_DIR="${HOME}/.2fa/raycast-2fa"
KEY_FILE="${KEY_DIR}/.raycast-2fa.key.dat"

echo "$CONTENTS" | openssl enc -aes-256-cbc -k "" > $KEY_FILE
echo "Updated"

