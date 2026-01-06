import { Action, ActionPanel, Detail, getPreferenceValues, Icon, List, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { ask } from "./chatgpt";

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<{ id: string, q: string; a: string; }[]>([]);
  const [loading, setLoading] = useState(false);

  const { aiProgram } = getPreferenceValues<Preferences>();

  useEffect(() => {
    const setReponse = async () => {
      const response = ask(searchText);
      setResults((previous) => [...previous, { id: `${previous.length}`, q: searchText, a: response }].reverse());
      setLoading(false);
    }
    if (loading && searchText.length > 4) {
      setReponse();
    }
    setSearchText("");
  }, [loading]);

  if (!aiProgram) {
    return (<Detail markdown="No AI Command Set" />);
  }

  return (
    <List 
      isShowingDetail 
      onSearchTextChange={setSearchText}
      isLoading={loading}
      searchText={searchText}
      selectedItemId={results[0]?.id}
      actions={
        <ActionPanel>
              <Action title="Get Answer" icon={Icon.Play} onAction={() => setLoading(true)}/>
        </ActionPanel>
      }>
      {results.map((item, index) => (
        <List.Item
          id={item.id}
          key={`${item.q}-${index}`}
          title={item.q}
          detail={
            <List.Item.Detail markdown={item.a}/>
          }
          actions={
            <ActionPanel>
              <Action title="Get Answer" icon={Icon.Play} onAction={() => setLoading(true)}/>
              <Action.CopyToClipboard title="Copy Response" content={item.a}/>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}