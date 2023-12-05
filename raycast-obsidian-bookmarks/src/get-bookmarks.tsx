import { ActionPanel, List, Action, popToRoot, Icon, Color } from "@raycast/api";
import { onOpen, useFiles } from "./utils/get/use-files";
import SortDropdown, { SortMode, setSortMode, sortModes } from "./utils/get/sort";
import openObsidianFile from "./utils/get/open-file";


export default function Command() {
  const { data, isLoading, fetchFiles } = useFiles();
  const onChange = async(newValue: string) => {
    await setSortMode(newValue as SortMode);
    fetchFiles();
  };
  return (
    <List isLoading={isLoading} searchBarAccessory={<SortDropdown sortModes={sortModes} onChange={onChange} />}>
      {data.map((file) => (
          <List.Item
            key={file.attributes.source}
            icon="obsidian-bookmarks.png"
            title={file.attributes.title}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={file.attributes.source} onOpen={async () => {
                  // popToRoot({ clearSearchBar: true });
                  await onOpen(file);
                  fetchFiles();
                }}/>
                <Action.CopyToClipboard title="Copy Link" content={file.attributes.source} />
                <Action icon={{ source: Icon.Circle, tintColor: Color.Purple }} title="Open in Obsidian" onAction={() => openObsidianFile(file.fileName)} />
              </ActionPanel>
            }
          />    
      ))}
    </List>
  );
}