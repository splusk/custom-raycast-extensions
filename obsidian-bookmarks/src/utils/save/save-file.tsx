import { LocalStorage, Toast, showToast } from "@raycast/api";
import { URL } from "node:url";
import * as path from "node:path";
import { File, FrontMatter, fileExists } from "../files";
import dedent from "ts-dedent";
import * as fs from "node:fs/promises";
import slugify from "./slugify";
import { getOrCreateBookmarksPath } from "../vault-path";
import { Link } from "./use-frontmost-link";

const formatDate = (date: Date): string => {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const getPublisher = (urlAsString: string): string | null => {
  try {
    const url = new URL(urlAsString);
    return url.hostname;
  } catch {
    // Because we don't treat invalid URLs as invalid bookmarks, we don't
    // necessarily want to break here. So we'll return null, since we don't
    // know who the publisher is.
    return null;
  }
}

async function getFileName(filename: string): Promise<string> {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const bookmarksPath = await getOrCreateBookmarksPath();
    let file = path.join(bookmarksPath, filename);
    let index = 1;
    while (await fileExists(file)) {
      const newFilename = `${base}-${index++}.md`;
      file = path.join(bookmarksPath, newFilename);
    }
    return file;
  }

export const saveToObsidian = async(file: File): Promise<string> => {
    const template = dedent`
    ---
    title: ${JSON.stringify(file.attributes.title)}
    saved: ${formatDate(file.attributes.saved)}
    source: ${JSON.stringify(file.attributes.source)}
    publisher: ${JSON.stringify(file.attributes.publisher)}
    read: ${JSON.stringify(file.attributes.read)}
    tags: ${JSON.stringify(file.attributes.tags)}
    ---

    ${file.body}
  `;

  await Promise.allSettled([
    fs.writeFile(file.fullPath, template, { encoding: "utf-8" }),
    LocalStorage.setItem(file.fileName, new Date().toISOString())
  ]);
  return file.fileName;
}

export const asFile = async(values: Link): Promise<File> => {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  const attributes: FrontMatter = {
    source: values.url,
    publisher: getPublisher(values.url),
    title: values.title,
    tags: [],
    saved: midnight,
    read: false,
  };

  const body = dedent`
  # [${values.title.replace(/[[\]]/g, "")}](${values.url})
  `;

  const frontmatter = dedent`
  title: ${JSON.stringify(attributes.title)}
  saved: ${formatDate(midnight)}
  source: ${JSON.stringify(attributes.source)}
  publisher: ${JSON.stringify(attributes.publisher)}
  read: ${JSON.stringify(attributes.read)}
  tags: ${JSON.stringify(attributes.tags)}
  `;

  const fileSlug = `${formatDate(midnight)}-${slugify(attributes.title)}`.slice(0, 150);
  const baseName = `${fileSlug}.md`;
  const fullPath = await getFileName(baseName);
  const fileName = path.basename(fullPath);

  return {
    attributes,
    frontmatter,
    body,
    fileName,
    fullPath,
    bodyBegin: 4 + frontmatter.length,
  };
}

export async function saveFile(file: File, isUpdate = false): Promise<File> {
  const toastPromise = showToast({
    style: Toast.Style.Animated,
    title: isUpdate ? "Updating Bookmark" : "Saving Bookmark",
  });
  const savePromise = saveToObsidian(file);

  const [toast, saved] = await Promise.allSettled([toastPromise, savePromise]);
  if (toast.status === "rejected") {
    throw new Error("Unexpected: Toast failed to display.");
  }
  if (saved.status === "rejected") {
    toast.value.style = Toast.Style.Failure;
    toast.value.message = String(saved.reason);
    toast.value.show();
    return Promise.reject(saved.reason);
  } else {
    toast.value.hide();
    return file;
  }
}