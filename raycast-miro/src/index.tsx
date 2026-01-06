import * as miro from "./oauth/miro";
import { useState } from "react";
import { Action, ActionPanel, Clipboard, Grid, Color } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { openInMiroApp } from "./oauth/miro";

export default function ListBoards() {
  const [searchText, setSearchText] = useState("");
  const { isLoading, data, revalidate } = useCachedPromise(
    async (searchString: string) => {
      await miro.authorize();
      return searchString && searchString.length >= 3 ? await miro.searchBoards(searchString) : await miro.fetchRecentItems();
    },
    [searchText],
    {
      initialData: [],
    }
  );
  
  return (
    <Grid isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={(str) => {
      setSearchText(str);
      revalidate();
      }}
      throttle={true}>
      {data.map((item) => {
        return (
          <Grid.Item
            key={item.id}
            id={item.id}
            content={item.picture?.imageURL ?? Color.SecondaryText}
            title={item.name}
            subtitle={item.description}
            actions={
              <ActionPanel>
                {item.viewLink && (
                  <>
                    <Action.OpenInBrowser title="Open in Browser" url={item.viewLink} />
                    <Action title="Open in App" onAction={() => openInMiroApp(item.viewLink)} />
                    <Action.CopyToClipboard title="Copy Link" content={item.viewLink} />
                  </>
                )}
                <Action title="Reload" onAction={() => revalidate()} />
                <Action title="Reauthorize" onAction={() => miro._authorize()} />
              </ActionPanel>
            }
          />
        );
      })}
    </Grid>
  );
}