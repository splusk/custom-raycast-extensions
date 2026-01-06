import { useState, useEffect } from "react";
import { Action, ActionPanel, getPreferenceValues, List, Clipboard, Icon } from "@raycast/api";
import { getLocalRepos } from "./fs";
import { getRemoteRepos } from "./githubClient";

export interface SimplifiedWorkspace {
    path: string;
    name: string;
    icon: string;
    openWith: any
    sshUrl?: string;
}

export default function ListRepos() {
  const [localRepos, setLocalRepos] = useState<SimplifiedWorkspace[]>([]);
  const [searchText, setSearchText] = useState("");
  const [remoteRepos, setRemoteRepos] = useState<SimplifiedWorkspace[]>([]);
  const { codePath, orgName } = getPreferenceValues();

  useEffect(() => {
    const folders = getLocalRepos(codePath);
    setLocalRepos(folders);
  }, []);

  useEffect(() => {
    const folders = getLocalRepos(codePath).filter((item) => item.name.includes(searchText));
    if (folders.length > 3) {
      setLocalRepos(folders);
    } else {
      setLocalRepos(folders);
      getRemoteRepos(searchText).then((repos) => {
        repos = repos.filter((item) => !folders.some((folder) => folder.name === item.name));
        setRemoteRepos(repos);
      });
    }
  }, [searchText]);

  const getCommitUrl = (repo: string) => {
    const { text: hash } = Clipboard.read();
    return `https://github.com/${orgName}/${repo}/commit/${hash}`
  }

  const actions = (item: SimplifiedWorkspace, isRemote: boolean) =>
    (<ActionPanel>
      {!isRemote ? <Action.Open title="Open in App" application={item.openWith} target={item.path} /> : <Action.OpenInBrowser title="Open in App" url={item.openWith} />}
      <Action.OpenInBrowser title="Open in Github" url={`https://github.com/${orgName}/${item.name}`}/>
      <Action.OpenInBrowser title="Open Online" url={`https://vscode.dev/github.com/${orgName}/${item.name}`} shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }} />
      <Action.CopyToClipboard title="Copy Clone Url" content={isRemote ? `git clone ${item.sshUrl}` : `cd ${item.path}`}/>
      <Action.OpenInBrowser title="View PRs" url={`https://github.com/${orgName}/${item.name}/pulls`}/>
      <Action.OpenInBrowser title="View Commit" url={getCommitUrl(item.name)}/>
    </ActionPanel>);

  return (
    <List
      navigationTitle="Search Repos"
      searchBarPlaceholder="Search repos"
      onSearchTextChange={setSearchText}
    >
      {localRepos.map((item) => (
        <List.Item
          key={item.name}
          title={`${item.name}`}
          icon={item.icon}
          actions={actions(item, false)}
        />
      ))}
      {remoteRepos.map((item) => (
        <List.Item
          key={item.name}
          title={item.name}
          icon={item.icon}
          actions={actions(item, true)}
        />
      ))}
      {searchText.length > 0 && localRepos.length === 0 && remoteRepos.length === 0 && (
        <List.EmptyView
          title="No Repositories Found"
          description={`No repositories found for "${searchText}", Search Github?`}
          icon={Icon.MagnifyingGlass}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser
                title="Open in Browser"
                url={`https://github.com/search?q=org%3Awebbhalsa+${searchText}&type=code`}
              />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}