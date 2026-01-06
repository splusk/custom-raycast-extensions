import { Action, ActionPanel, Clipboard, closeMainWindow, List, popToRoot, showHUD } from "@raycast/api";
import { RegisterForm } from "./RegisterForm";
import { removeService, getToken, Service } from "./util";

export const ServiceList = ({ services }: { services: Service[] }) => {
  const copyToClipboard = async (code: string) => {
    await Clipboard.copy(getToken(code));
    await showHUD("Copied to clipboard");
    await popToRoot();
    await closeMainWindow();
  };

  if (!services || services.length === 0) {
    return <RegisterForm />;
  }

  return (
    <List>
      {services.map((service) => {
        return (
          <List.Item
            key={service.name}
            icon="list-icon.png"
            title={service.name}
            actions={
              <ActionPanel>
                <Action title="Copy" onAction={() => copyToClipboard(service.code)} />
                <Action.Push title="Add New Service" target={<RegisterForm />} />
                <Action
                  title="Delete Service"
                  onAction={async () => {
                    removeService(services, service);
                    await popToRoot();
                  }}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
};
