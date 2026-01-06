import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { isReadWrite, isSubdirectory } from "./files";
import { getCurrentVaultName } from "./get/sort";

export interface Preferences {
    vaultPath: string;
    vaultNames: string;
    bookmarksPath: string;
    sortOrder: string;
}

export const showErrorToast = (error: unknown): Promise<Toast> => {
    return showToast({
        style: Toast.Style.Failure,
        title: String(error),
      });
  }

export const getVaultPath = async(): Promise<string> => {
  const { vaultPath, vaultNames } = getPreferenceValues<Preferences>();
  const currentVaultName = await getCurrentVaultName();

  if (vaultPath == null || !vaultPath.trim()) {
    showErrorToast(
      "Vault Path is a required preference that must be set to an absolute path."
    );
    return "";
  }

  // The vault path must be an absolute path to a folder on the disk.
  // It can either be a path starting from root (/path/to/vault)
  // Or a path starting from the home directory (~/documents/vault)
  let basePath: string;
  if (path.isAbsolute(vaultPath)) {
    basePath = vaultPath;
  } else if (vaultPath.startsWith("~/")) {
    basePath = `${os.homedir()}${vaultPath.slice(1)}`;
  } else {
    showErrorToast(
      "Vault Path is a required preference that must be set to an absolute path."
    );
    return "";
  }

  // Construct the full vault path by joining base path with vault name
  const fullVaultPath = path.join(basePath, currentVaultName);

  // The path must exist on disk and be a directory.
  try {
    const stat = await fs.stat(fullVaultPath);
    if (!stat.isDirectory()) {
      showErrorToast(
        `Vault Path points to a file, instead of a directory: ${fullVaultPath}`
      );
    }
  } catch {
    showErrorToast(`Vault Path did not link to an existing directory: ${fullVaultPath}`);
  }

  // And finally, the directory must be read/write accessible.
  if (!(await isReadWrite(fullVaultPath))) {
    showErrorToast(`Vault Path is not read/write accessible: ${fullVaultPath}`);
  }

  return fullVaultPath;
}

export const getOrCreateBookmarksPath = async(): Promise<string> => {
  const vaultPath = await getVaultPath();

  const { bookmarksPath } = getPreferenceValues<Preferences>();
  const fullBookmarksPath = path.resolve(path.join(vaultPath, bookmarksPath));
  if (fullBookmarksPath !== vaultPath && !isSubdirectory(vaultPath, fullBookmarksPath)) {
    // We don't want someone to try to spoof their way into a directory they shouldn't have access to.
    // The bookmarks directory *must* be a child directory (or just the root) of the Obsidian vault.
    showErrorToast(
      "The Bookmarks path must be a subdirectory of your Obsidian Vault."
    );
  }

  // Now we need to create the path to where we save bookmarks, if it doesn't already exist.
  // At this point, we can guarantee that:
  // 1. The Vault exists and is read/writeable (otherwise the getVaultPath call would've errored).
  // 2. The bookmarks path is a valid subdirectory.
  // So we need to try:
  // 1. Checking to see if the bookmarks directory exists.
  // 2. If it does, then it must be read/write friendly.
  // 3. Otherwise, we need to be able to successfully create it.
  try {
    const stat = await fs.stat(fullBookmarksPath);
    // We found something at this path. Let's make sure it's a directory and that it's read/write accessible.
    if (!stat.isDirectory()) {
      showErrorToast(
        "The Bookmarks path must be a directory, but a file was found instead."
      );
    } else if (!(await isReadWrite(fullBookmarksPath))) {
      showErrorToast(
        "The Bookmarks path must be to a directory with proper read/write permissions set."
      );
    }
  } catch {
    // The bookmarks folder doesn't exist yet. That's ok! Let's try to create it.
    try {
      await fs.mkdir(fullBookmarksPath, { recursive: true });
    } catch (err) {
      // We failed to create the folder. But I wouldn't be sure why at this point.
      // So we'll show the toast, but show the configuration error message.
      // (We *should* have write access at this point, so only issue would be something weird
      // and probably recoverable on a retry.)
      showErrorToast(
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  return fullBookmarksPath;
}
