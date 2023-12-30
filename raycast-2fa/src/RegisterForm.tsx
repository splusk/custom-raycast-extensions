import { Action, ActionPanel, Form, popToRoot, showToast, Toast } from "@raycast/api";
import { addService, Service } from "./util";

export const RegisterForm = () => {
  const notifyRegistering = async () => {
    await showToast({
      style: Toast.Style.Animated,
      title: "Registering",
    });
  };
  return (
    <Form
      navigationTitle={"Register a service"}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save"
            onSubmit={async (service: Service) => {
              await notifyRegistering();
              await addService(service);
              await popToRoot();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Name" />
      <Form.PasswordField id="code" title="Auth Key" />
    </Form>
  );
};
