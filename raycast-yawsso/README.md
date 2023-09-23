# AWS Profiles

## Introduction
This plugin will read your profiles from `~/.aws/config` and present them as options to be selected. If there is also a matching entry in `~/.aws/credentials` it will automatically be presented to you as well to be selected and copied to the clipboard.

If a profile is found but has no matching credentials then hitting the **Enter** key will login with the profile and on success copy the the `AWS` variables to the clipboard ready for you to paste into the shell.

## Prereqs
- yawsso - which is expected to be on the $PATH `/opt/homebrew/bin`

## Install
`yarn install && yarn run build`

## Improvements
- ???
