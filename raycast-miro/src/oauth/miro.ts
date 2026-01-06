import { getPreferenceValues, OAuth, LocalStorage } from "@raycast/api";
import fetch from "node-fetch";
import { Board } from "@mirohq/miro-api";
import { execSync } from "child_process";

// Miro App client ID
const preferences: {
  clientId: string;
} = getPreferenceValues();

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Miro Board",
  providerIcon: "miro-logo.png",
  providerId: "miro-board",
  description: "Connect your Miro account.",
});

export const openInMiroApp = (url?: string) => {
  try {
    return execSync(
        `miro ${url}`,
        { env: { ...process.env, PATH: "/usr/local/bin:/usr/bin" } }
    );
} catch (error: any) {
    return `Failed to launch app due to: ${error.message}`;
}
}

export async function _authorize() {
  const authRequest = await client.authorizationRequest({
    endpoint: "https://miro.oauth.raycast.com/authorize",
    clientId: "3458764538138428083",
    scope: "",
  });
  const { authorizationCode } = await client.authorize(authRequest);
  const tokens = await fetchTokens(authRequest, authorizationCode);
  await client.setTokens(tokens);
}

// Authorization
export async function authorize() {
  const teamId = await LocalStorage.getItem("teamId");
  const tokenSet = await client.getTokens();
  if (tokenSet?.accessToken) {
    if (tokenSet.refreshToken) {
      if (tokenSet.isExpired() || !teamId) {
        try {
          const tokens = await refreshTokens(tokenSet.refreshToken);
          await client.setTokens(tokens);
        } catch (error: any) {
          console.log(`Error with getting refresh tokens due to: ${error.message}`);
          return;
        }
      }
      return;
    } else if (teamId) {
      return;
    }
  }
  await _authorize();
}

// Fetch tokens
export async function fetchTokens(
  authRequest: OAuth.AuthorizationRequest,
  authCode: string
): Promise<OAuth.TokenResponse> {
  const response = await fetch("https://miro.oauth.raycast.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: preferences.clientId,
      code: authCode,
      code_verifier: authRequest.codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: authRequest.redirectURI,
    }),
  });
  if (!response.ok) {
    console.error("fetch tokens error:", await response.text());
    throw new Error(response.statusText);
  }
  const result = (await response.json()) as OAuth.TokenResponse & { team_id: string };
  await LocalStorage.setItem("teamId", result.team_id);
  return result;
}

// Refresh tokens
async function refreshTokens(refreshToken: string): Promise<OAuth.TokenResponse> {
  const response = await fetch("https://miro.oauth.raycast.com/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: preferences.clientId,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) {
    console.error("refresh tokens error:", await response.text());
    throw new Error(response.statusText);
  }
  const tokenResponse = (await response.json()) as OAuth.TokenResponse & { team_id: string };
  await LocalStorage.setItem("teamId", tokenResponse.team_id);
  tokenResponse.refresh_token = tokenResponse.refresh_token ?? refreshToken;
  return tokenResponse;
}

// Fetch boards
export async function fetchItems(): Promise<Board[]> {
  const teamId = await LocalStorage.getItem("teamId");

  if (typeof teamId !== "string") {
    throw new Error("Team ID not found");
  }

  const response = await fetch(`https://api.miro.com/v2/boards?team_id=${teamId}&sort=default`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("fetch items error:", await response.text());
    throw new Error(response.statusText);
  }

  const json = (await response.json()) as { data: Board[] };
  return json.data;
}

export async function fetchRecentItems(): Promise<Board[]> {
  const response = await fetch(`https://api.miro.com/v2/boards?limit=20&sort=last_modified`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("fetch items error:", await response.text());
    throw new Error(response.statusText);
  }

  const json = (await response.json()) as { data: Board[] };
  return json.data;
}

export async function searchBoards(searchString: string): Promise<Board[]> {
  const response = await fetch(`https://api.miro.com/v2/boards?query=${searchString}&limit=20&sort=last_modified`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("fetch items error:", await response.text());
    throw new Error(response.statusText);
  }

  const json = (await response.json()) as { data: Board[] };
  return json.data;
}
