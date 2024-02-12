import { ActionPanel, List, Action, Icon, Color } from "@raycast/api";
import { onOpen, useFiles } from "./utils/get/use-files";
import SortDropdown, { SortMode, setSortMode, sortModes } from "./utils/get/sort";
import openObsidianFile from "./utils/get/open-file";


export default function Command() {
  const {isLoading, data, fetchFiles } = useFiles();
  const onChange = (newValue: string) => {
    setSortMode(newValue as SortMode).then(() => fetchFiles());
  };
  return (
    <List isLoading={isLoading} searchBarAccessory={<SortDropdown sortModes={sortModes} onChange={onChange} />}>
      {data && data.map((file) => (
          <List.Item
            key={file.attributes.source}
            icon="obsidian-bookmarks.png"
            title={file.attributes.title}
            detail={
              <List.Item.Detail markdown="![Illustration](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png)" />
            }
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={file.attributes.source} onOpen={async () => {
                  // popToRoot({ clearSearchBar: true });
                  await onOpen(file);
                }}/>
                <Action.CopyToClipboard title="Copy Link" content={file.attributes.source} />
                <Action icon={{ source: Icon.Circle }} title="Fetch Bookmarks" onAction={() => fetchFiles()} />
                <Action icon={{ source: Icon.Circle, tintColor: Color.Purple }} title="Open in Obsidian" onAction={() => openObsidianFile(file.fileName)} />
              </ActionPanel>
            }
          />    
      ))}
    </List>
  );
}