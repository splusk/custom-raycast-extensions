import { ActionPanel, Action, Icon, List, getPreferenceValues, Clipboard, showHUD } from "@raycast/api";
import { useEffect, useState } from "react";
import * as path from 'path';
import { getFiles, openFile } from "./get-files";

export default function Command() {
  const { directories } = getPreferenceValues<Preferences>();
  const [ files, setFiles ] = useState<{file: string, isDir: boolean}[]>([]);
  const [ selectedFolder, setSelectedFolder ] = useState<string|null>(null);
  
  
  useEffect(() => {
    const _getFiles = async () => {
      if (selectedFolder) {
        console.log(`Getting files for ${selectedFolder}`);
        const f = await getFiles(selectedFolder);
        setFiles(f);
      }
    };
    _getFiles();
  }, [selectedFolder]);

  const getMarkdown = (filePath: string) => {
    const path = encodeURI(filePath);
    return `![Preview](${path})`;
  }

  const copyFile = async (filePath: string) => {
    try {
      const fileContent: Clipboard.Content = { file: filePath };
      await Clipboard.copy(fileContent);
      await showHUD("File copied to clipboard");
    } catch (error) {
      console.log(`Could not copy file '${filePath}'. Reason: ${error}`);
    }
  }

  const baseFolders = directories.split(',');

  if (!selectedFolder) {
    return (
      <List>
        {baseFolders.map((directory: string) => (
          <List.Item
            key={directory}
            title={directory}
            icon={Icon.Folder}
            actions={
              <ActionPanel>
                <Action
                  title="Select"
                  icon={Icon.Finder}
                  onAction={() => setSelectedFolder(directory.trim())}
                />
              </ActionPanel>
            }
          />
        ))}
      </List>
    );
  }

  return (
    <List isShowingDetail={true}>
      {files.map((item) => {
        const fullPath = `${selectedFolder}/${item.file}`;
        return (
          <List.Item
            key={item.file}
            icon={item.isDir ? Icon.Folder : Icon.Image}
            title={item.file}
            actions={
              <ActionPanel>
                <Action title="Copy" icon={Icon.CopyClipboard} onAction={() => copyFile(fullPath)}/>
                <Action title='Open' icon={Icon.Finder} onAction={() => item.isDir ? setSelectedFolder(fullPath) : openFile(fullPath)} />
                <Action.Open title="Open in Default Application" shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }} target={fullPath} />
                <Action title="Go Back" shortcut={{ modifiers: ["cmd", "shift"], key: "arrowUp" }} onAction={() => {
                  const folder = baseFolders.some((dir) => dir === selectedFolder) ? null : path.dirname(selectedFolder);
                  setSelectedFolder(folder);
                }} />
              </ActionPanel>
            }
            detail={
              <List.Item.Detail
                markdown={item.isDir ? `` : getMarkdown(fullPath)}
              />
            }
          />
      )})}
    </List>
  );
}