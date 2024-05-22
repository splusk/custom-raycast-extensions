import { useEffect, useState } from "react";
import { Action, ActionPanel, Clipboard, closeMainWindow, popToRoot, List, showHUD } from "@raycast/api";
import { ViewProfile, authenticate, getMetaDetails, getExportableProperties, login, parseConfigFile, parseCredentialsFile, requiresAuthentication, runAutoCmd } from "./util";

const notify = async (message: string) => {
  await showHUD(message);
  popToRoot({ clearSearchBar: true });
  closeMainWindow({ clearRootSearch: true });
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [profiles, setProfiles] = useState([] as string[]);
  const [allProfiles, setAllProfiles] = useState([] as string[]);
  const [exsitingEnvs, setExsitingEnvs] = useState([] as ViewProfile[]);

  // Check for exsisting credentials
  useEffect(() => {
    parseCredentialsFile().then(s => setExsitingEnvs(s));
  }, []);

  // Load local profiles
  useEffect(() => {
    parseConfigFile().then(c => setAllProfiles(c));
  }, []);

  useEffect(() => {
    if (searchText && searchText.length > 0) {
      const filteredProfiles: string[] = allProfiles.filter(i => i.indexOf(searchText) > - 1);
      setProfiles(filteredProfiles);
    }
  }, [searchText]);

  const items = profiles.length > 0 ? profiles : allProfiles;

  return (
    <List isShowingDetail onSearchTextChange={(newValue) => setSearchText(newValue)}>
      {items.map((item) => {
        const details = getExportableProperties(exsitingEnvs, item)
        const metaDetails = getMetaDetails(details);
        return (
          <List.Item 
            key={item} 
            title={item} 
            actions={
              <ActionPanel>
                <Action title="Authenticate" onAction={async () => {
                    if (requiresAuthentication(details)) {
                      try {
                        authenticate(item);
                        await showHUD(`authenticate due to: ${item}`);
                        await Clipboard.clear();
                      } catch (error: any) {
                        await showHUD(`Failed to authenticate due to: ${error.message}`);
                      }
                    }
                    const profile = `export AWS_PROFILE="${item}"`;
                    await Clipboard.copy(profile);
                    notify(`${profile} copied to clipboard`);
                  }}
                />
                <Action title="Login to AWS" onAction={async () => {
                    try {
                      login();
                    } catch (error: any) {
                      await showHUD(`Failed to login due to: ${error.message}`);
                    }
                  }}
                />
                <Action title="Copy Env Variables" shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }} onAction={async () => {
                    try {
                      const entry = (await parseCredentialsFile()).filter(entry => entry.profile === item)?.[0];
                      if (entry?.vars) {
                        await Clipboard.copy(entry.vars);
                        closeMainWindow()
                      }
                    } catch (error: any) {
                      await showHUD(`Failed to get variables: ${error.message}`);
                    }
                  }}
                />
                <Action title="Run Command" shortcut={{ modifiers: ["opt"], key: "enter" }} onAction={async () => {
                    try {
                      const { text: hostName } = await Clipboard.read();
                      const result = await runAutoCmd(hostName);
                      if (result) {
                        await Clipboard.copy(result.replace(/\n/g, ""));
                        await showHUD(`${result} copied to clipboard`);
                      } else {
                        await showHUD(`Run command failed to return a result`);
                      }
                    } catch (error: any) {
                      await showHUD(`Failed to run command due to: ${error.message}`);
                    }
                  }}
                />
              </ActionPanel>
            }
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Profile" text={item} />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label title={metaDetails[0][0]} text={metaDetails[0][1]} />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label title={metaDetails[1][0]} text={metaDetails[1][1]} />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label title={metaDetails[2][0]} text={metaDetails[2][1]} />
                    <List.Item.Detail.Metadata.Separator />
                  </List.Item.Detail.Metadata>
                }
                markdown={details}
              />
            }
        />)})}
    </List>
  );
}