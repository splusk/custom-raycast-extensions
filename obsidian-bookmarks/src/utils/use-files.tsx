import { useCallback, useEffect, useState } from "react";
import getObsidianFiles from "./get-files";
import { File, unique } from "./files";

export type FilesHook = { loading: boolean; files: File[] };
export default function useFiles(): FilesHook {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const addFiles = useCallback(
    (newFiles: File[]) => {
      setFiles((orig) => {
        const unsorted = unique([...orig, ...newFiles]);
        const sorted = unsorted.sort((a, b) => a.attributes.title.localeCompare(b.attributes.title));
        return sorted;
      });
    },
    [setFiles]
  );

  useEffect(() => {
    const obsidian = getObsidianFiles().then((files) => addFiles(files));

    Promise.allSettled([obsidian]).then(() => setLoading(false));
  }, [addFiles, setLoading]);

  return { files, loading };
}