import { usePromise } from "@raycast/utils";
import { getObsidianFiles } from "./get-files";
import { File, FrontMatter } from "../files";
import { sortFilesByPref } from "./sort";
import { useRef, useState } from "react";
import { moveFile, saveFile, updateFileOnOpen } from "../save/save-file";
import { readFile } from 'fs/promises';
import path from 'path';

export type FilesHook = { loading: boolean; files: File[] };

export const useFiles = () => {
  const [searchText, setSearchString] = useState<string|undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const abortable = useRef<AbortController>();
  const { isLoading, data, } = usePromise(
    async (searchString?: string, _refreshKey?: number) => {
      const newFiles = await getObsidianFiles();
      const internalBookarmarks = await getInternalBookmarks();
      const allFiles = [...newFiles, ...internalBookarmarks];
      // Filter out archived bookmarks
      const nonArchivedFiles = allFiles.filter((file) => !file.attributes.tags?.includes('archive'));
      const sortedFiles = await sortFilesByPref(nonArchivedFiles);
      if (searchString && sortedFiles) {
        return sortedFiles.filter((file) => {
          return file.attributes.title.toLowerCase().includes(searchString.toLowerCase()) ||
            file.attributes.tags?.map(tag => {
                try {
                  return tag.includes('-') ? tag.split('-').join(" ") : tag;
                } catch (e) {
                  return tag
                }
              }).join(", ").toLowerCase().includes(searchString.toLowerCase());
        });
      }
      return sortedFiles;
    },
    [searchText, refreshKey],
    {abortable},
  );

  const fetchFiles = (text?: string, refresh = false) => {
    setSearchString(text);
    if (refresh) {
      setRefreshKey(prev => prev + 1);
    }
  };

  return { isLoading, data, fetchFiles };
}

export const useSearchFiles = () => {
  const [searchText, setSearchString] = useState<string|undefined>(undefined);
  const abortable = useRef<AbortController>();
  const { isLoading, data, } = usePromise(
    async (searchString?: string) => {
      const allFiles = await getSearchBookmarks();
      const sortedFiles = await sortFilesByPref(allFiles);
      if (searchString && sortedFiles) {
        return sortedFiles.filter((file) => {
          return file.attributes.title.toLowerCase().includes(searchString.toLowerCase()) ||
            file.attributes.tags?.join(", ").toLowerCase().includes(searchString.toLowerCase());
        });
      }
      return sortedFiles;
    },
    [searchText],
    {abortable},
  );

  const searchFiles = (text?: string) => setSearchString(text);

  return { searchLoading: isLoading, searchData: data, searchFiles };
}

export const onOpen = async(file: File) => {
  updateFileOnOpen(file).then((updatedFile) => saveFile(updatedFile, true));
}

export const resetRanking = async(file: File) => {
  const updatedFile = { ...file, attributes: { ...file.attributes, rank: 0 } };
  saveFile(updatedFile, true);
}

export const archiveBookmark = async(file: File) => {
  moveFile(file);
}

const loadData = async (fileName: string) => {
  const filePath = path.join(__dirname, `assets/${fileName}`);
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.info(`Could not find file ${filePath}:`);
    return null;
  }
}

const getInternalBookmarks = async () => {
  const data = await loadData('bookmarks.json');
  if (!data) return [];
  return data?.bookmarks?.map((bookmark: FrontMatter) => ({
    attributes: {
      ...bookmark
    },
    body: "",
    frontmatter: "",
    fileName: "",
    fullPath: "",
    bodyBegin: 0,
  }));
}

const getSearchBookmarks = async () => {
  const data = await loadData('searchBookmarks.json');
  return data?.bookmarks?.map((bookmark: FrontMatter) => ({
    attributes: {
      ...bookmark
    },
    body: "",
    frontmatter: "",
    fileName: "",
    fullPath: "",
    bodyBegin: 0,
  }));
}
