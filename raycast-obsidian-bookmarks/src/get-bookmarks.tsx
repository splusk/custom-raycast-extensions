import { ActionPanel, List, Action, Icon, Color, BrowserExtension, open } from "@raycast/api";
import { onOpen, useFiles, resetRanking, archiveBookmark } from "./utils/get/use-files";
import SortDropdown, { SortMode, setSortMode, sortModes } from "./utils/get/sort";
import openObsidianFile from "./utils/get/open-file";
import { SaveForm } from "./save-bookmark";
import { useEffect, useState } from "react";


export default function Command() {
  const {isLoading, data, fetchFiles } = useFiles();
  const [showSaveModal, setShowSaveModal ] = useState(false);
  const [tabs, setTabs] = useState<BrowserExtension.Tab[]>([]);
  const [tabToSave, setTabToSave] = useState<BrowserExtension.Tab|undefined>(undefined);

  const onChange = (newValue: string) => {
    setSortMode(newValue as SortMode).then(() => fetchFiles());
  };
  
  const saveTabAsBookmark = (tab: BrowserExtension.Tab) => {
	  setShowSaveModal(!showSaveModal);
	  setTabToSave(tab);
  }

  useEffect(() => {
    const onLoad = async() => {
      try {
        const openTabs = await BrowserExtension.getTabs();
        const filteredList = Array.from(new Map(openTabs.map(item => [item.url, item])).values());
        const sortedTabs = filteredList.sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0));
        setTabs(sortedTabs)
      } catch (error: any) {
        console.log(error.meessage)
      }
    }
    onLoad();
  }, []);
  
  if (showSaveModal) {
    return <SaveForm tab={tabToSave} />;
  }
  
  return (
    <List isLoading={isLoading} searchBarAccessory={<SortDropdown sortModes={sortModes} onChange={onChange} />}>
      <>
        {tabs.map((tab) => (
          <List.Item
            key={tab.id}
            icon={tab.favicon}
            title={tab.title || ''}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={tab.url}/>
                <Action title="Save as Bookmark" 
                  shortcut={{ modifiers: ["cmd", "shift"], key: "s" }} 
                  onAction={() => saveTabAsBookmark(tab)}
                />
                <Action.OpenInBrowser url={tab.url} />
                <Action.CopyToClipboard content={tab.url} />
              </ActionPanel>
            }
          />
      ))}
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
                <Action icon={{ source: Icon.Move }} 
                  title="Arhive Bookmark"
                  onAction={() => archiveBookmark(file)} 
                  shortcut={{ modifiers: ["cmd", "shift"], key: "m" }} 
                />
                <Action icon={{ source: Icon.Circle }} title="Fetch Bookmarks" onAction={() => fetchFiles()} />
                <Action icon={{ source: Icon.Circle, tintColor: Color.Purple }} title="Open in Obsidian" onAction={() => openObsidianFile(file.fileName)} />
                <Action icon={{ source: Icon.Circle }} title="Reset Ranking" onAction={() => resetRanking(file)} />
              </ActionPanel>
            }
          />
      ))}
        <List.Item
            key="test-patients"
            icon={Icon.Dna}
            title="Test Patients"
            actions={
              <ActionPanel>
                <Action title="Show Test Patients" 
                  onAction={async() => open('raycast://extensions/shane/raycast-bo-patients/index')}
                />
              </ActionPanel>
            }
        />
      </>
    </List>
  );
}