import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useState } from "react";
import { ask } from "./chatgpt";

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<{ q: string; a: string; }[]>([]);

  const fetchAnswer = () => {
      if (searchText.length > 4) {
        const response = ask(searchText);
        setResults((previous) => [...previous, { q: searchText, a: response }]);
        setSearchText("");
    } 
  }

  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(() => {
  //     if (searchText.length > 4) {
  //       const response = ask(searchText);
  //       setResults((previous) => [...previous, { q: searchText, a: response }]);
  //       setSearchText("");
  //   } 
  //   }, 2000)

  //   return () => clearTimeout(delayDebounceFn)
  // }, [searchText]);

  return (
    <List 
      isShowingDetail 
      onSearchTextChange={setSearchText} 
      actions={
        <ActionPanel>
              <Action title="Get Answer" icon={Icon.Play} onAction={fetchAnswer}/>
        </ActionPanel>
      }>
      {results.reverse().map((item) => (
        <List.Item
          key={item.q}
          title={item.q}
          detail={
            <List.Item.Detail markdown={item.a}/>
          }
          actions={
            <ActionPanel>
              <Action title="Get Answer" icon={Icon.Play} onAction={fetchAnswer}/>
              <Action.CopyToClipboard title="Copy Response" content={item.a}/>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
