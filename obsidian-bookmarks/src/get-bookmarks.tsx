import { ActionPanel, List, Action } from "@raycast/api";
import { onOpen, useFiles } from "./utils/get/use-files";


export default function Command() {
  const { data, isLoading, revalidate } = useFiles();

  return (
    <List isLoading={isLoading}>
      {data.map((file) => (
          <List.Item
          key={file.attributes.source}
          icon="obsidian-bookmarks.png"
          title={file.attributes.title}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={file.attributes.source} onOpen={async () => {
                await onOpen(file.fileName);
                revalidate();
              }}/>
              <Action.CopyToClipboard title="Copy Link" content={file.attributes.source} />
            </ActionPanel>
          }
        />    
      ))}
    </List>
  );
}