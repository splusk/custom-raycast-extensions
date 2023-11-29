import { ActionPanel, List, Action, popToRoot } from "@raycast/api";
import { onOpen, useFiles } from "./utils/get/use-files";
import SortDropdown, { SortMode, setSortMode, sortModes } from "./utils/get/sort";


export default function Command() {
  const { data, isLoading, revalidate } = useFiles();
  const onChange = async(newValue: string) => {
    await setSortMode(newValue as SortMode);
    revalidate();
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