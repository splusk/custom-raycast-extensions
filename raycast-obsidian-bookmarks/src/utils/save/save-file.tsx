import { Toast, showToast } from "@raycast/api";
import { URL } from "node:url";
import * as path from "node:path";
import { formatDateForFileName, File, FrontMatter, fileExists } from "../files";
import dedent from "ts-dedent";
import * as fs from "node:fs/promises";
import slugify from "./slugify";
import { Link } from "./use-frontmost-link";
import { getOrCreateBookmarksPath } from "../vault-path";

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

const getFileName = async(filename: string): Promise<string> => {
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
    // tags: [${file.attributes.tags?.map(t => t).join(',')}]
    const template = dedent`
    ---
    title: ${JSON.stringify(file.attributes.title)}
    created: ${JSON.stringify(file.attributes.created)}
    source: ${JSON.stringify(file.attributes.source)}
    publisher: ${JSON.stringify(file.attributes.publisher)}
    tags: [${file.attributes.tags?.map(t => t)?.join(',')}]
    rank: ${JSON.stringify(file.attributes.rank)}
    ---

    ${file.body}
  `;

  if (template.length === 0) {
    throw new Error("Template is empty");
  } else {
    await Promise.allSettled([
      fs.writeFile(file.fullPath, template, { encoding: "utf-8" }),
    ]);
    return file.fileName;
  }

}

export const asFile = async(values: Link): Promise<File> => {

  const attributes: FrontMatter = {
    source: values.url,
    publisher: getPublisher(values.url),
    title: values.title,
    tags: values.tags?.split(",").map(tag => tag.trim().replace(/\s+/g, '-')) || [],
    icon: "obsidian-bookmarks.png",
    created: new Date(),
    rank: 0,
  };

  const body = dedent`
  # [${values.title.replace(/[[\]]/g, "")}](${values.url})
  `;

  const frontmatter = dedent`
  title: ${JSON.stringify(attributes.title)}
  source: ${JSON.stringify(attributes.source)}
  publisher: ${JSON.stringify(attributes.publisher)}
  tags: ${JSON.stringify(attributes.tags)}
  rank: ${JSON.stringify(attributes.rank)}
  `;

  const dateForFileName = new Date()
  dateForFileName.setHours(0, 0, 0, 0);
  const fileSlug = `${formatDateForFileName(dateForFileName)}-${slugify(attributes.title)}`.slice(0, 150);
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

export const updateFileOnOpen = async(file: File): Promise<File> => {
  const attributes: FrontMatter = {
    ...file.attributes,
    rank: file.attributes?.rank ? file.attributes.rank + 10 : 5
  };

  const updated = {
    ...file,
    attributes,
  };
  return updated;
}

export const saveFile = async(file: File, isUpdate = false): Promise<File> => {
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

export const moveFile = async(file: File) => {
  const bookmarkpath = await getOrCreateBookmarksPath();
  const archiveDir = path.join(bookmarkpath, "archive");
  const archivePath = path.join(archiveDir, file.fileName);

  await fs.mkdir(archiveDir, { recursive: true });
  await fs.rename(file.fullPath, archivePath);
}
