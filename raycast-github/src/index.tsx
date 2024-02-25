import { useState, useEffect } from "react";
import { Action, ActionPanel, getPreferenceValues, Icon, List } from "@raycast/api";
import { getDirectSubfolders, SimplifiedWorkspace } from "./fs";
import { Repo, getRepos } from "./githubClient";

const NTELLIJ_APP_NAME = "IntelliJ IDEA";
const VS_CODE_APP_NAME = "Visual Studio Code";

export default function ListRepos() {
  const [localRepos, setLocalRepos] = useState<SimplifiedWorkspace[]>([]);
  const [searchText, setSearchText] = useState("");
  const [remoteRepos, setRemoteRepos] = useState<SimplifiedWorkspace[]>([]);
  const { kryCodePath, orgName } = getPreferenceValues();

  useEffect(() => {
    const folders = getDirectSubfolders(kryCodePath);
    setLocalRepos(folders);
  }, []);

  useEffect(() => {
    const folders = getDirectSubfolders(kryCodePath).filter((item) => item.name.includes(searchText));
    if (folders.length > 0) {
      setLocalRepos(folders);
    } else {
      getRepos(searchText).then((repos) => {
        setRemoteRepos(repos.map((item: Repo) => ({
          path: item.html_url,
          name: item.name,
          icon: "github.png",
          defaultApp: "IntelliJ IDEA",
          sshUrl: item.ssh_url
        })));
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
              <Action.OpenInBrowser title="Open in Github" url={`https://github.com/${orgName}/${item.name}`}/>
              <Action.Open title="Open in App" application={item.defaultApp} target={item.path} />
              <Action.OpenInBrowser title="View PRs" url={`https://github.com/${orgName}/${item.name}/pulls`}/>
              <Action.Open title="Open with Intellij" application={NTELLIJ_APP_NAME} target={item.path} />
              <Action.Open title="Open with VS Code" application={VS_CODE_APP_NAME} target={item.path} />
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