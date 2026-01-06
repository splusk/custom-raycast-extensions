/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Paths - Comma, separated list of paths to Folder containing files. */
  "directories": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `list-files` command */
  export type ListFiles = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `list-files` command */
  export type ListFiles = {}
}

