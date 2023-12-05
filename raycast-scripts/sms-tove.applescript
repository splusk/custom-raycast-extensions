#!/usr/bin/osascript

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Text Tove
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 💬
# @raycast.argument1 { "type": "text", "placeholder": "Enter text message" }

# Documentation:
# @raycast.description Send Person a Text Message
# @raycast.author Chris Pennington
# @raycast.authorURL @cpenned on Twitter

on run argv
  tell application "Messages"
    set targetBuddy to "‭+46 76-019 28 71‬"
    set targetService to id of 1st account whose service type = iMessage
    set textMessage to ( item 1 of argv )
    set theBuddy to participant targetBuddy of account id targetService
    send textMessage to theBuddy
  end tell
  log "Message sent"
end run