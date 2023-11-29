import { LocalStorage } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { getObsidianFiles } from "./get-files";
import { File } from "../files";
import { getPopularityScoreBasedOnDate, getSortFunc } from "./sort";

export type FilesHook = { loading: boolean; files: File[] };

export const useFiles = () => {
  return useCachedPromise(
    async () => {
      const newFiles = await getObsidianFiles();
      return getSortFunc().then((fn) => fn(newFiles));
    },
    [],
    {
      initialData: [],
      keepPreviousData: true
    },
  );
}

export const onOpen = async(file: File) => {
  const fileName = file.fileName;
  await LocalStorage.setItem(fileName, new Date().toISOString());
  const popScore = await LocalStorage.getItem(`${fileName}-pop`) as string | undefined;
  if (popScore) {
    await LocalStorage.setItem(`${fileName}-pop`, `${parseInt(popScore) * 100}`);
  } else {
    const score = await getPopularityScoreBasedOnDate(file, 100);
    await LocalStorage.setItem(`${fileName}-pop`, `${score}`);
  }
}