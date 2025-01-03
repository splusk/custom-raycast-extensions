import * as miro from "./oauth/miro";
import { useState } from "react";
import { Action, ActionPanel, Clipboard, List, Color } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { openInMiroApp } from "./oauth/miro";


export default function Command() {
  const [searchText, setSearchText] = useState("");
  const { isLoading, data, revalidate } = useCachedPromise(
    async (str: string) => {
      await miro.authorize();
      return await miro.searchBoards(str);
    },
    [searchText],
    {
      initialData: []
    }
  );

  return (
    <List
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={(str) => {
        setSearchText(str);
        revalidate();
      }}
      throttle={true}
      navigationTitle="Search Boards"
      searchBarPlaceholder="Search Miro boards"
    >
      {data.map((item) => (
        <List.Item
          key={item.id}
          title={item.name}
          icon={item.picture?.imageURL ?? Color.SecondaryText}
          actions={
            <ActionPanel>
              {item.viewLink && (
                <>
                  <Action.OpenInBrowser title="Open in Browser" url={item.viewLink} />
                  <Action title="Open in App" onAction={() => openInMiroApp(item.viewLink)} />
                  <Action.CopyToClipboard title="Copy Link" shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }} content={item.viewLink} />
                </>
                )}
              <Action title="Reload" onAction={() => revalidate()} />
              <Action title="Reauthorize" onAction={() => miro._authorize()} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
