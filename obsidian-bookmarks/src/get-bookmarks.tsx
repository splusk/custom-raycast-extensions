import { ActionPanel, List, LocalStorage, Action } from "@raycast/api";
import { useFilesByLastOpened } from "./utils/get/use-files";
import { useEffect, useState } from "react";
import { File } from "./utils/files";
import { sortFilesByLastOpened } from "./utils/get/get-files";

export default function Command() {
  const { files, loading } = useFilesByLastOpened();
  const [fileResult, setFileResults] = useState<File[]>(files);

  useEffect(() => {
      setFileResults(files);
  }, [files]);

  return (
    <List isLoading={loading}>
      {fileResult.map((file) => (
          <List.Item
          key={file.attributes.source}
          icon="obsidian-bookmarks.png"
          title={file.attributes.title}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={file.attributes.source} onOpen={async () => {
                await LocalStorage.setItem(file.fileName, new Date().toISOString());
                sortFilesByLastOpened(files).then((sortedByLast) => {
                  setFileResults(sortedByLast);
                });
                // popToRoot();
              }}/>
              <Action.CopyToClipboard title="Copy Link" content={file.attributes.source} />
            </ActionPanel>
          }
        />    
      ))}
    </List>
  );
}
