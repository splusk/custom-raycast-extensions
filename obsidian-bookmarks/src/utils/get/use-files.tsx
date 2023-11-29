import { LocalStorage, getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { Preferences } from "../vault-path";
import getObsidianFiles, { sortByLastUsed, sortByTitle } from "./get-files";
import { File } from "../files";

export type FilesHook = { loading: boolean; files: File[] };

export const useFiles = () => {
  return useCachedPromise(
    async () => {
      const newFiles = await getObsidianFiles();
      return await getSortFunc()(newFiles);
    },
    [],
    {
      initialData: [],
      keepPreviousData: true
    },
  );
}

export const onOpen = async(fileName: string) => {
  await LocalStorage.setItem(fileName, new Date().toISOString());
}

const getSortFunc = () => {
  const { sortOrder } = getPreferenceValues<Preferences>();
  switch (sortOrder) {
    case "lastUsed":
      return sortByLastUsed;
    case "title":
    default:
      return sortByTitle;
  }
}