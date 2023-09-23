import { useEffect, useState } from "react";
import { Action, ActionPanel, Clipboard, closeMainWindow, popToRoot, List, showHUD } from "@raycast/api";
import { ViewProfile, authenticate, getDetails, getExportableProperties, login, parseConfigFile, parseCredentialsFile, requiresAuthentication } from "./util";

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
        const props: string = getExportableProperties(exsitingEnvs, item);
        const requiresAuth = requiresAuthentication(props);
        const metaDetails = getDetails(exsitingEnvs, item);
        return (
          <List.Item 
            key={item} 
            title={item} 
            actions={
              <ActionPanel>
                <Action title="Select" onAction={async () => {
                    if (!requiresAuth) {
                      await Clipboard.copy(props);
                      notify(`${item} env variables set and copied to clipboard`);
                    } else {
                      try {
                        authenticate(item); // authenticate copies to clipboard
                        notify(`${item} env variables set and copied to clipboard`);
                      } catch (error: any) {
                        await showHUD(`Failed to authenticate due to: ${error.message}`);
                      }
                    }
                  }}
                />
                <Action title="Login" onAction={async () => {
                    try {
                      login();
                    } catch (error: any) {
                      await showHUD(`Failed to login due to: ${error.message}`);
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
                markdown={getExportableProperties(exsitingEnvs, item)}
              />
            }
        />)})}
    </List>
  );
}