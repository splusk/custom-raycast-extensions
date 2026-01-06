import { readFile } from "fs";
import path from "path";
import { useRef, useState } from "react";

export const useSearchFiles = () => {
  const [searchText, setSearchString] = useState<string|undefined>(undefined);
  const abortable = useRef<AbortController>();
  const { isLoading, data, } = usePromise(
    async (searchString?: string) => {
      const allFiles = await getSearchBookmarks();
      const sortedFiles = await sortFilesByPref(allFiles);
      if (searchString && sortedFiles) {
        return sortedFiles.filter((file) => {
          return file.attributes.title.toLowerCase().includes(searchString.toLowerCase()) || file.attributes.tags?.join(", ").includes(searchString);
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

const loadData = async (fileName: string) => {
  const filePath = path.join(__dirname, `assets/${fileName}`);
  const raw = readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

const getSearchBookmarks = async () => {
  const data = await loadData('searchBookmarks.json');
  return data.bookmarks.map((bookmark: FrontMatter) => ({
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