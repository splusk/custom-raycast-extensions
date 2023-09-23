#!/bin/bash

KEY_FILE="${HOME}/.2fa/raycast-2fa/.raycast-2fa.key.dat"

if [[ -f "$KEY_FILE" ]]; then
    CONTENTS=$(openssl enc -aes-256-cbc -d -pass pass:"" -in $KEY_FILE)
    echo $CONTENTS
else
    echo "No record found"
fi
