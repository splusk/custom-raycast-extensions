import path from "node:path";
import { URLSearchParams } from "node:url";
import { getPreferenceValues, open } from "@raycast/api";
import { getCurrentVaultName } from "./sort";

export async function createObsidianUri(file: string, inBookmarks = true): Promise<string> {
  const prefs = getPreferenceValues<Preferences>();
  const vaultName = await getCurrentVaultName();
  const filePath = inBookmarks ? path.join(prefs.bookmarksPath, file) : file;

  const params = new URLSearchParams();
  params.set("vault", vaultName);
  params.set("file", filePath);
  return `obsidian://open?${params.toString().replaceAll("+", "%20")}`;
}

export default async function openObsidianFile(file: string, inBookmarks = true): Promise<void> {
  const url = await createObsidianUri(file, inBookmarks);
  return open(url);
}