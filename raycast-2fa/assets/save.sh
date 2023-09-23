#!/bin/bash

NAME="$1"
CODE=$2

KEY_DIR="${HOME}/.2fa/raycast-2fa"
KEY_FILE="${KEY_DIR}/.raycast-2fa.key.dat"

if [[ ! -d "${KEY_DIR}" ]]; then
    mkdir -p "${KEY_DIR}"
fi

CONTENTS=""
if [[ -f $KEY_FILE ]]; then
  CONTENTS=$(openssl enc -aes-256-cbc -d -pass pass:"" -in $KEY_FILE)
fi

echo "$NAME,$CODE:$CONTENTS" | openssl enc -aes-256-cbc -k "" > $KEY_FILE
echo "Saved"

