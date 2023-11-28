import { LocalStorage } from "@raycast/api";
import fs from "node:fs/promises";
import path from "node:path";
import frontMatter from "front-matter";
import { File, FrontMatter } from "./files";
import { getOrCreateBookmarksPath } from "./vault-path";

function isFulfilledPromise<T>(v: PromiseSettledResult<T>): v is PromiseFulfilledResult<T> {
  return v.status === "fulfilled";
}

export default async function getObsidianFiles(): Promise<Array<File>> {
  const bookmarksPath = await getOrCreateBookmarksPath();

  const files = await fs.readdir(bookmarksPath);
  const markdown = files.filter((file) => file.endsWith(".md"));
  const promises = markdown.map((file) =>
    fs.readFile(path.join(bookmarksPath, file), { encoding: "utf-8" }).then((val) => ({
      ...frontMatter<FrontMatter>(val),
      fileName: file,
      fullPath: path.join(bookmarksPath, file),
    }))
  );

  const results = await Promise.allSettled(promises);
  const fileResults = await results.filter(isFulfilledPromise).map((result) => result.value);

  return fileResults;
}

export const sortFilesByTitle = (files: File[]) => {
  return Promise.resolve(files.sort((a, b) => a.attributes.title.localeCompare(b.attributes.title)));
};

export const sortFilesByLastOpened = (files: File[]) => {
  const checkForLastOpenedDates = async () => {
    return await Promise.all(files.map(async (value) => {
      const aDate = await LocalStorage.getItem<string>(value.fileName);
      const lastOpened = aDate ? new Date(aDate) : new Date(value.attributes.saved);
      return {
        lastOpened,
        ...value
      }
    }));
  }

  return checkForLastOpenedDates().then((results) => {
    return results.sort((a,b) => {
      return a.lastOpened.getTime() - b.lastOpened.getTime()
    }).reverse();
  });
};
