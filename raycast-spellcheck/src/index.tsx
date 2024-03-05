import { useEffect, useState } from "react";
import { getPreferenceValues, ActionPanel, Clipboard, List, Action } from "@raycast/api";
import axios from 'axios';

const preferences: {
  xRapidApiKey: string;
  lang: string;
} = getPreferenceValues();

const SPELLING_MATCH_SUCCESS = 'Your spelling looks good!'
const SPELLING_MATCH_FAIL = 'Dam not even I can work this word out';

export default function Command() {
  const [searchText, setSearchText] = useState<string|undefined>("");
  const [correctSpelling, setCorrectSpelling] = useState<string>("");
  const [results, setResults] = useState<Array<string>>([]);

  useEffect(() => {
    const fetchSpelling = async (searchString: string) => {
      try {
        const response = await axios.request({
          method: 'GET',
          url: 'https://webspellchecker-webspellcheckernet.p.rapidapi.com/ssrv.cgi',
          headers: {
            'X-RapidAPI-Key': preferences.xRapidApiKey,
            'X-RapidAPI-Host': 'webspellchecker-webspellcheckernet.p.rapidapi.com'
          },
          params: {
            cmd: 'check_spelling',
            text: searchString,
            slang: preferences.lang,
            out_type: 'words',
            format: 'json'
          },
        });
        if (response.data.length > 0) {
          console.log(response.data[0].suggestions);
          if (response.data[0].suggestions.length > 0) {
            setResults(response.data[0].suggestions);
          } else {
            setResults([SPELLING_MATCH_FAIL]);
          }
        } else {
          setCorrectSpelling(searchString)
          setResults([SPELLING_MATCH_SUCCESS]);
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (searchText && searchText.length > 3) {
      fetchSpelling(searchText).catch(console.error);
    }

  }, [searchText]);

  useEffect(() => {
      Clipboard.readText().then((text) => {
        Clipboard.clear().then(() => {
          setSearchText(text);
        });
      });
  }, [searchText]);

  return (
    <List
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search..."
      throttle={true}
    >
      {results.map((result) => {
        const clipboardText = results.length === 1 && result === SPELLING_MATCH_SUCCESS ? correctSpelling : result;
        return (
          <List.Item
            key={result}
            title={result}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard title="Copy" content={clipboardText} />
              </ActionPanel>
            }
          />
      )})}
    </List>
  );
}
