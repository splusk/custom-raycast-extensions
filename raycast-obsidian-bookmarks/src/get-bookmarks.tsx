import { ActionPanel, List, Action, Icon, Color, BrowserExtension, closeMainWindow, getPreferenceValues } from "@raycast/api";
import { onOpen, useFiles, resetRanking, archiveBookmark, useSearchFiles } from "./utils/get/use-files";
import SortDropdown, { SortMode, setSortMode, getSortMode, SORT_MODES, sortModes, VaultMode, getVaultModes } from "./utils/get/sort";
import { getChromeTabsSorted } from "./utils/get/get-tabs";
import openObsidianFile from "./utils/get/open-file";
import { SaveForm } from "./save-bookmark";
import { useEffect, useState } from "react";
import { runAppleScript } from "@raycast/utils";
import { File } from "./utils/files";
import { useVaultMode } from "./utils/get/use-vault-mode";


export default function Command() {
  const { vaultMode, updateVaultMode } = useVaultMode();
  const { isLoading, data: savedBookmarks, fetchFiles } = useFiles();
  const { searchData } = useSearchFiles();
  const [ searchText, setSearchText ] = useState("");
  const [ showSaveModal, setShowSaveModal ] = useState(false);
  const [ currentSortMode, setCurrentSortMode ] = useState<SortMode>(SORT_MODES.ALL);
  const [ chromeTabs, setChromeTabs ] = useState<BrowserExtension.Tab[]>([]);
  const [ tabToSave, setTabToSave ] = useState<BrowserExtension.Tab|undefined>(undefined);
  const vaultModesList = getVaultModes();

  const onChange = async (newValue: string) => {
     // Check if this is a vault mode change or sort mode change
     if (vaultModesList.includes(newValue)) {
       await updateVaultMode(newValue);
       fetchFiles(searchText, true);
     } else {
       setCurrentSortMode(newValue as SortMode);
       await setSortMode(newValue as SortMode);
       fetchFiles(searchText, true);
     }
  }

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    fetchFiles(text);
    getChromeTabs(text);
  };

  const saveTabAsBookmark = (tab: BrowserExtension.Tab) => {
	  setShowSaveModal(!showSaveModal);
	  setTabToSave(tab);
  }

  const getChromeTabs = async(text?: string) => {
    const result = await getChromeTabsSorted(text);
    setChromeTabs(result);
  }

  const getActiveChromeTab = async() => {
    const result = await getChromeTabsSorted();
    if (result) {
      return result.find(tab => tab.active);
    }
    return undefined;
  }

  const getIcon = (file: File, defaultIcon?: Icon) => {
    if(file.attributes.icon && file.attributes.icon in Icon) {
      return Icon[file.attributes.icon as keyof typeof Icon];
    } else if (file.attributes.publisher) {
      return { source: `https://${file.attributes.publisher}/favicon.ico` }
    }
    return defaultIcon || Icon.Bookmark;
  }

  const focusChromeTab = async (tab: BrowserExtension.Tab) => {
    const url = tab.url;
    await runAppleScript(`
      on run argv
        set targetUrl to item 1 of argv
        tell application "Brave Browser"
          repeat with w in windows
              set tabIndex to 1
              repeat with t in tabs of w
                  if URL of t contains targetUrl then
                      set active tab index of w to tabIndex
                      set index of w to 1
                      activate
                      return
                  end if
                  set tabIndex to tabIndex + 1
              end repeat
          end repeat
        end tell
      end run
    `, [url]);
    closeMainWindow();
  };

  const showSearchItems = searchText.length > 3 && searchData && chromeTabs.length < 3 && (savedBookmarks?.length ?? 0) < 3;

  useEffect(() => {
    getChromeTabs();
    getSortMode().then((mode) => {
      setCurrentSortMode(mode as SortMode);
    });
  }, []);

  if (showSaveModal) {
    return <SaveForm tab={tabToSave} />;
  }

  return (
    <List
      isLoading={isLoading}
      filtering={false}
      searchText={searchText}
      onSearchTextChange={handleSearchChange}
      searchBarAccessory={<SortDropdown sortModes={sortModes} vaultModes={vaultModesList} onChange={onChange} />}
      >
      <>
        {(currentSortMode === SORT_MODES.CHROME || currentSortMode === SORT_MODES.ALL) && chromeTabs?.map((tab, index) => (
          <List.Item
            key={`${tab.id}-${index}`}
            icon={tab.favicon}
            title={tab.title || ''}
            accessories={[{ text: 'Browser' }]}
            actions={
              <ActionPanel>
                <Action title="Focus" icon={{ source: Icon.Globe }} onAction={() => focusChromeTab(tab)} />
                <Action title={`Save as Bookmark (${vaultMode})`} icon={{ source: Icon.SaveDocument }}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
                  onAction={() => saveTabAsBookmark(tab)}
                />
                <Action.CopyToClipboard title="Copy Link" content={tab.url} />
              </ActionPanel>
            }
          />
        ))}
        {currentSortMode !== SORT_MODES.CHROME && savedBookmarks?.map((file, index) => (
            <List.Item
              key={`${file.attributes.source}-${index}`}
              icon={getIcon(file)}
              title={file.attributes.title}
              accessories={[{ text: file.attributes.tags?.join(", ") }]}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser url={file.attributes.source} onOpen={async () => await onOpen(file)}/>
                  <Action.CopyToClipboard title="Copy Link" content={file.attributes.source}/>
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
        {showSearchItems && searchData.map((file: File, index) => (
          <List.Item
            key={`${file.attributes.source}-${index}`}
            icon={getIcon(file, Icon.MagnifyingGlass)}
            title={file.attributes.title || ''}
            accessories={[{ text: 'Search' }]}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={file.attributes.source.replace('%s', searchText)} />
              </ActionPanel>
            }
          />
        ))}
      </>
    </List>
  );
}
