import { LocalStorage } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { getObsidianFiles } from "./get-files";
import { File } from "../files";
import { getPopularityScore, getSortFunc } from "./sort";

export type FilesHook = { loading: boolean; files: File[] };

export const useFiles = () => {
  const { data, isLoading, revalidate } = useCachedPromise(
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
  return { data, isLoading, fetchFiles: revalidate };
}
export const onOpen = async(file: File) => {
  const fileName = file.fileName;
  const entry = await LocalStorage.getItem(fileName) as string | undefined;
  const score = await getPopularityScore(entry, 50);
  await LocalStorage.setItem(fileName, `${new Date().toISOString()},${score}`);
}