import { useState, useEffect } from "react";
import { Action, ActionPanel, getPreferenceValues, List } from "@raycast/api";
import { getLocalRepos } from "./fs";
import { getRemoteRepos } from "./githubClient";

export interface SimplifiedWorkspace {
    path: string;
    name: string;
    icon: string;
    defaultApp: string;
    sshUrl?: string;
}

export default function ListRepos() {
  const [localRepos, setLocalRepos] = useState<SimplifiedWorkspace[]>([]);
  const [searchText, setSearchText] = useState("");
  const [remoteRepos, setRemoteRepos] = useState<SimplifiedWorkspace[]>([]);
  const { kryCodePath, orgName, defaultApp, clientDefaultApp } = getPreferenceValues();

  useEffect(() => {
    const folders = getLocalRepos(kryCodePath);
    setLocalRepos(folders);
  }, []);

  useEffect(() => {
    const folders = getLocalRepos(kryCodePath).filter((item) => item.name.includes(searchText));
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
  

  return (
    <List
      filtering={true}
      navigationTitle="Search Repos"
      searchBarPlaceholder="Search repos"
      onSearchTextChange={setSearchText}
    >
      {localRepos.map((item) => (
        <List.Item
          key={item.name}
          title={item.name}
          icon={item.icon}
          actions={
            <ActionPanel>
              <Action.Open title="Open in App" application={item.defaultApp} target={item.path} />
              <Action.OpenInBrowser title="Open in Github" url={`https://github.com/${orgName}/${item.name}`}/>
              <Action.OpenInBrowser title="View PRs" url={`https://github.com/${orgName}/${item.name}/pulls`}/>
              <Action.Open title="Open with Default App" application={defaultApp} target={item.path} />
              <Action.Open title="Open with Client App" application={clientDefaultApp ? clientDefaultApp: defaultApp} target={item.path} />
            </ActionPanel>
          }
        />
      ))}
      {remoteRepos.map((item) => (
        <List.Item
          key={item.name}
          title={item.name}
          icon={item.icon}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="Open in Github" url={item.path}/>
              <Action.CopyToClipboard title="Copy Clone Url" content={item.sshUrl || item.path}/>
              <Action.OpenInBrowser title="View PRs" url={`${item.path}/pulls`}/>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}