import { useCallback, useEffect, useState } from "react";
import getObsidianFiles, { sortFilesByLastOpened, sortFilesByTitle } from "./get-files";
import { File, unique } from "./files";

export type FilesHook = { loading: boolean; files: File[] };

export const useFiles = (sortFunc: (files: File[]) => Promise<File[]>): FilesHook  => {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const addFiles = useCallback(async (newFiles: File[]) => {
      const unsorted = unique([...files, ...newFiles]);
      const sorted = await sortFunc(unsorted);
      setFiles(sorted);
    },
    [setFiles]
  );

  useEffect(() => {
    const obsidian = getObsidianFiles().then((files) => addFiles(files));

    Promise.allSettled([obsidian]).then(() => setLoading(false));
  }, [addFiles, setLoading]);

  return { files, loading };
}

export const useFilesByTitle = (): FilesHook => {
  return useFiles(sortFilesByTitle);
}

export const useFilesByLastOpened = (): FilesHook  => {
  return useFiles(sortFilesByLastOpened);
}