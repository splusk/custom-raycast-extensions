import fs from "node:fs/promises";
import path from "node:path";
import frontMatter from "front-matter";
import { File, FrontMatter } from "../files";
import { getOrCreateBookmarksPath } from "../vault-path";

const bookmarkFileNaming = /^\d{4}-\d{2}-\d{2}.*\.md$/;

function isFulfilledPromise<T>(v: PromiseSettledResult<T>): v is PromiseFulfilledResult<T> {
  return v.status === "fulfilled";
}

export const getObsidianFiles = async(): Promise<Array<File>> => {
  const bookmarksPath = await getOrCreateBookmarksPath();

  const files = await fs.readdir(bookmarksPath);
  const markdown = files.filter((file) => bookmarkFileNaming.test(file));
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


