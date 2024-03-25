import { usePromise } from "@raycast/utils";
import { getObsidianFiles } from "./get-files";
import { File } from "../files";
import { sortFilesByPref } from "./sort";
import { useRef } from "react";
import { saveFile, updateFileOnOpen } from "../save/save-file";

export type FilesHook = { loading: boolean; files: File[] };

export const useFiles = () => {
  const abortable = useRef<AbortController>();
  const { isLoading, data, revalidate } = usePromise(
    async () => {
      const newFiles = await getObsidianFiles();
      const sortedFiles = await sortFilesByPref(newFiles);
      return sortedFiles;
    },
    [], 
    {abortable},
  );
  return { isLoading, data, fetchFiles: revalidate };
}

export const onOpen = async(file: File) => {
  updateFileOnOpen(file).then((updatedFile) => saveFile(updatedFile, true));
}

export const resetRanking = async(file: File) => {
  const updatedFile = { ...file, attributes: { ...file.attributes, rank: 0 } };
  saveFile(updatedFile, true);
}