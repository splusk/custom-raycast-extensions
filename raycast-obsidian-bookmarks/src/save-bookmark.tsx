import { Action, ActionPanel, BrowserExtension, closeMainWindow, getPreferenceValues, Form, popToRoot, showToast, Toast } from "@raycast/api";
import { useEffect, useRef } from "react";
import useLinkForm from "./utils/save/use-link-form";
import { asFile as convertToFile, saveFile } from "./utils/save/save-file";
import { copyUrl } from "./utils/save/copy-url";
import { Link } from "./utils/save/use-frontmost-link";
import { useVaultMode } from "./utils/get/use-vault-mode";

export const SaveForm = ({ tab }: { tab?: BrowserExtension.Tab }) => {
  const { values, onChange, loading: linkLoading } = useLinkForm({ title: tab?.title, url: tab?.url });
  const toastRef = useRef<Toast>();
  const loadingRef = useRef(linkLoading);
  const { vaultMode } = useVaultMode();

  const getVaultName = () => vaultMode;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loadingRef.current) {
        showToast({
          title: "Fetching link details",
          style: Toast.Style.Animated,
        }).then((toast) => {
          toastRef.current = toast;
        });
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    loadingRef.current = linkLoading;
    if (!linkLoading) {
      toastRef.current?.hide();
    }
  }, [linkLoading]);

  return (
    <Form
      navigationTitle={`Save Bookmark to ${getVaultName()} Vault`}
      isLoading={linkLoading}
      actions={
        <ActionPanel>
                <Action.SubmitForm
                  title="Save Bookmark"
                  onSubmit={async (values) => {
                    const file = await convertToFile({
                      ...values,
                      url: tab?.url || values.url,
                    } as Link);
                    const savedFile = await saveFile(file);
                    await Promise.allSettled([copyUrl(savedFile), showToast({
                      title: "Linked Copied",
                      style: Toast.Style.Success,
                    })]);
                    popToRoot();
                    await closeMainWindow({ clearRootSearch: true });
                  }}
                />
              </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" value={values.title} onChange={onChange("title")} />
      <Form.TextField id="url" title="URL" value={values.url} onChange={onChange("url")} />
      <Form.TextField id="tags" title="Tags" value={values.tags} onChange={onChange("tags")}/>
    </Form>
  );
}
