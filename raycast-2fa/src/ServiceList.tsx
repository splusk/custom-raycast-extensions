import { Action, ActionPanel, Clipboard, closeMainWindow, List, popToRoot, showHUD } from "@raycast/api";
import { generateToken } from "node-2fa";
import { RegisterForm } from "./RegisterForm";
import { exec } from "child_process";

interface FA_TOKEN {
  token: string;
}

export const ServiceList = ({ services }: { services: string[] }) => {
  const copyToClipboard = async (code: string) => {
    const value = /^\d+$/.test(code) && code.length === 12 ? code : (generateToken(code) as FA_TOKEN).token;
    await Clipboard.copy(value);
    // const token = generateToken(code) as FA_TOKEN;
    // await Clipboard.copy(token.token);
    await showHUD("Copied to clipboard");
    popToRoot();
    await closeMainWindow();
  };
  const deleteItem = (code: string) => {
    const newServices = services.filter((service) => !service.includes(code));
    exec("sh " + __dirname + `/assets/update.sh ${newServices}`, (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      if (stdout && stdout.includes("Updated")) {
        popToRoot();
      }
    });
  };
  return (
    <List>
      {services.map((service: string, index: number) => {
        const [name, code] = service.split(",");
        if (name && code) {
          return (
            <List.Item
              key={index}
              icon="list-icon.png"
              title={name}
              actions={
                <ActionPanel>
                  <Action title="Copy" onAction={() => copyToClipboard(code)} />
                  <Action.Push title="Add new item" target={<RegisterForm />} />
                  <Action title="Delete" onAction={() => deleteItem(code)} />
                </ActionPanel>
              }
            />
          );
        }
      })}
    </List>
  );
};
