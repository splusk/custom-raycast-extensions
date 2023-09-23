import { Action, ActionPanel, Form, popToRoot, showToast, Toast } from "@raycast/api";
import { exec } from "child_process";

interface RegisterFormOptions {
  name: string;
  code: string;
}

export const RegisterForm = () => {
  const notifyRegistering = async () => {
    await showToast({
      style: Toast.Style.Animated,
      title: "Registering",
    });
  }
  return (
    <Form
      navigationTitle={"Register a service"}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save"
            onSubmit={(values: RegisterFormOptions) => {
              notifyRegistering();
              exec("sh " + __dirname + `/assets/save.sh "${values.name}" "${values.code}"`,
                (error, stdout, stderr) => {
                  if (error) {
                    throw error;
                  }
                  if (stdout && stdout.includes("Saved")) {
                    popToRoot();
                  }
                }
              );
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Name" />
      <Form.PasswordField id="code" title="Two-Step Auth Key" />
    </Form>
  );

}