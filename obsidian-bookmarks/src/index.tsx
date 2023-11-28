import { ActionPanel, List, Action } from "@raycast/api";
import useFiles from "./utils/use-files";
import { useEffect, useState } from "react";
import { File } from "./utils/files";

export default function Command() {
  const { files } = useFiles();
  const [fileResult, setFileResults] = useState<File[]>(files);

  useEffect(() => {
    const sortedByLast = files.sort((a,b) => {
      return new Date(a.attributes.saved).getTime() - 
          new Date(b.attributes.saved).getTime()
    }).reverse();
    setFileResults(sortedByLast);
  }, [files]);

  return (
    <List>
      {fileResult.map((file) => (
          <List.Item
          key={file.attributes.source}
          icon="obsidian-bookmarks.png"
          title={file.attributes.title}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={file.attributes.source} />
              <Action.CopyToClipboard title="Copy Link" content={file.attributes.source} />
            </ActionPanel>
          }
        />    
      ))}
    </List>
  );
}
