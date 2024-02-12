import {
  updateCommandMetadata,
  environment,
  LaunchType,
  showToast,
  Toast,
  getPreferenceValues,
  closeMainWindow,
  showHUD,
  confirmAlert
} from "@raycast/api";
import { execSync } from "child_process";
import { setTimeout } from "timers/promises";
import { generateToken } from "node-2fa";

interface Arguments {
  pinCode?: string;
}

const preferences: {
  autoDismiss?: boolean;
  promptBeforeDisconnecting?: boolean;
  profileUri: string;
  profileName: string;
  mfaKey: string;
  pinCode: string;
} = getPreferenceValues();

async function pollStatus(expectedStatus: RegExp, timeoutSeconds = 15) {
  for (let i = 0; i < timeoutSeconds; i++) {
    const currentStatus = execSync(`sh ${__dirname}/assets/status.sh "${preferences.profileName}"`).toString().trim();
    if (currentStatus.match(expectedStatus)) return;
    await setTimeout(1000);
  }
  throw Error("Timed out");
}

async function connect(pinCode: string | undefined) {
  const connectingToast = await showToast({
    style: Toast.Style.Animated,
    title: "Connecting...",
    message: preferences.profileName
  });
  const { token } = generateToken(preferences.mfaKey) || {};
  try {
    execSync(`sh ${__dirname}/assets/connect.sh "${pinCode}" "${token}" "${preferences.profileName}"`);
    if (preferences.autoDismiss) closeMainWindow({ clearRootSearch: true });
    await pollStatus(/\d+ (secs|mins?)/i);
    connectingToast.hide();
    if (preferences.autoDismiss) {
      await showHUD("Connected to VPN");
    } else {
      await showToast({
        style: Toast.Style.Success,
        title: "Connected to VPN",
        message: preferences.profileName
      });
    }
  } catch (e) {
    if (preferences.autoDismiss) await showHUD("Failed to connect to VPN");
    connectingToast.hide();
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to connect to VPN",
      message: (e as Error).message
    });
  }
}

async function disconnect() {
  if (
    preferences.promptBeforeDisconnecting &&
    !(await confirmAlert({
      title: "Are you sure you want to disconnect from VPN?"
    }))
  )
    return;

  const disconnectingToast = await showToast({
    style: Toast.Style.Animated,
    title: "Disconnecting...",
    message: preferences.profileName
  });
  try {
    execSync(`sh ${__dirname}/assets/disconnect.sh "${preferences.profileName}"`);
    if (preferences.autoDismiss) closeMainWindow({ clearRootSearch: true });
    await pollStatus(/Disconnected/i);
    disconnectingToast.hide();
    if (preferences.autoDismiss) {
      await showHUD("Disconnected from VPN");
    } else {
      await showToast({
        style: Toast.Style.Success,
        title: "Disconnected from VPN",
        message: preferences.profileName
      });
    }
  } catch (e) {
    if (preferences.autoDismiss) await showHUD("Failed to disconnect from VPN");
    disconnectingToast.hide();
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to disconnect from VPN",
      message: (e as Error).message
    });
  }
}

function checkOrImportProfile() {
  execSync(`sh ${__dirname}/assets/import.sh "${preferences.profileUri}" "${preferences.profileName}"`);
}

enum State {
  DISCONNECTED = "Disconnected",
  CONNECTING = "Connecting",
  CONNECTED = "Connected"
}

type Status =
  | {
      state: State.DISCONNECTED | State.CONNECTING;
    }
  | {
      state: State.CONNECTED;
      onlineFor: string;
    };

function getStatus(): Status {
  const status = execSync(`sh ${__dirname}/assets/status.sh "${preferences.profileName}"`).toString().trim();
  if (status.includes("Connecting")) return { state: State.CONNECTING };
  if (status.includes("Disconnected") || status.includes("Inactive")) return { state: State.DISCONNECTED };
  return { state: State.CONNECTED, onlineFor: status };
}

async function updateSubtitle(status: Status) {
  const meta = status.state === State.CONNECTED ? `to: ${preferences.profileName} (${status.onlineFor})` : "";
  await updateCommandMetadata({ subtitle: `${status.state} ${meta}` });
}

export default async function Command(props: { arguments: Arguments }) {
  let status = getStatus();
  if (environment.launchType === LaunchType.UserInitiated) {
    try {
      checkOrImportProfile();
    } catch (e) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to find profile",
        message: preferences.profileName
      });
      return;
    }
    if (status.state === State.CONNECTED || status.state === State.CONNECTING) {
      await disconnect();
    } else {
      await connect(preferences.pinCode || props.arguments.pinCode);
    }
  }
  do {
    status = getStatus();
    await updateSubtitle(status);
    await setTimeout(1000);
  } while (status.state === State.CONNECTED && status.onlineFor.match(/sec/));
}
