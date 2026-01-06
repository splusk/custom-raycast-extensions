import { useEffect, useState } from "react";
import { getPreferenceValues, Clipboard, Detail, ActionPanel, Action } from "@raycast/api";
import translate from "@iamtraction/google-translate";

const preferences: {
  from: string;
  to: string;
} = getPreferenceValues();


const translateToLangugage = async (text: string) => {
  if (text) {
    const translated = await translate(text, {
      from: preferences.from,
      to: preferences.to,
      raw: true,
    });
    return translated;
  }
  return { text: "" };
};

export default function Command() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  useEffect(() => {
    Clipboard.readText().then(async (value) => {
      const copiedValue = value ?? "";
      setText(copiedValue);
      const translated = await translateToLangugage(copiedValue);
      setTranslatedText(translated.text ?? "");
      // Clipboard.clear();
    });
}, [text]);

return (
    <>
    <Detail
      markdown={translatedText ?? ""}
      navigationTitle="Translate"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Orginal" text={text.replace(/\n/g, "")} />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={async () => {
            const translated = await translateToLangugage(text);
            setTranslatedText(translated.text ?? "");
            }}/>
          <Action.CopyToClipboard title="Copy Translated" content={translatedText ?? ""} />
          <Action.OpenInBrowser
              title="Open in Google Translate"
              shortcut={{ modifiers: ["opt"], key: "enter" }}
              url={
                "https://translate.google.com/?sl=" +
                preferences.from +
                "&tl=" +
                preferences.to +
                "&text=" +
                encodeURIComponent(text) +
                "&op=translate"
              }
            />
        </ActionPanel>
      }
    />
  </>
  );
}
