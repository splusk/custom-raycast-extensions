import { Octokit } from "@octokit/core";
import { getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";
import { SimplifiedWorkspace } from ".";

const CLIENT_LABNGUAGES = ["javascript", "typescript", "html", "swift"];
const { orgName, authToken, defaultApp, clientDefaultApp } = getPreferenceValues()

const octokit = new Octokit({
  auth: authToken,
  request: {
    fetch: fetch,
  },
});

export interface RemoteRepo {
  html_url: string;
  name: string;
  icon: string;
  ssh_url: string;
  language: string;
}

export const getRemoteRepos = async (name: string) : Promise<SimplifiedWorkspace[]> => {
  const result = await octokit.request('GET /search/repositories/', {
    q: `org:${orgName} in:name ${name}`,
  });
  if (result?.data?.items.length > 0) {
    return result.data.items.map((item: RemoteRepo) => ({
          path: item.html_url,
          name: item.name,
          sshUrl: item.ssh_url,
          defaultApp: CLIENT_LABNGUAGES.includes(item.language.toLocaleLowerCase()) && clientDefaultApp ? clientDefaultApp : defaultApp,
          icon: 'https://github.com/github.png?size=32',
    }));
  }
  return [];
}
