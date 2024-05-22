import { ActionPanel, List, Action, Icon, Color } from "@raycast/api";
import { onOpen, useFiles, resetRanking } from "./utils/get/use-files";
import SortDropdown, { SortMode, setSortMode, sortModes } from "./utils/get/sort";
import openObsidianFile from "./utils/get/open-file";
import LinkForm from "./save-bookmark";
import { useState } from "react";


export default function Command() {
  const {isLoading, data, fetchFiles } = useFiles();
  const [showSaveModal, setShowSaveModal ] = useState(false);
  const onChange = (newValue: string) => {
    setSortMode(newValue as SortMode).then(() => fetchFiles());
  };
  if (showSaveModal) {
    return <LinkForm />;
  }
  return (
    <List isLoading={isLoading} searchBarAccessory={<SortDropdown sortModes={sortModes} onChange={onChange} />}>
      {data && data.map((file) => (
          <List.Item
            key={file.attributes.source}
            icon="obsidian-bookmarks.png"
            title={file.attributes.title}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={file.attributes.source} onOpen={async () => {
                  // popToRoot({ clearSearchBar: true });
                  await onOpen(file);
                }}/>
                <Action.CopyToClipboard title="Copy Link" content={file.attributes.source}/>
                <Action icon={{ source: Icon.SaveDocument }} 
                  title="Save Bookmark" 
                  onAction={() => setShowSaveModal(!showSaveModal)} 
                  shortcut={{ modifiers: ["cmd", "shift"], key: "s" }} 
                />
                <Action icon={{ source: Icon.Circle }} title="Fetch Bookmarks" onAction={() => fetchFiles()} />
                <Action icon={{ source: Icon.Circle, tintColor: Color.Purple }} title="Open in Obsidian" onAction={() => openObsidianFile(file.fileName)} />
                <Action icon={{ source: Icon.Circle }} title="Reset Ranking" onAction={() => resetRanking(file)} />
              </ActionPanel>
            }
          />    
      ))}
    </List>
  );
}