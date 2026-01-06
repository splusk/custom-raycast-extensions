import { Octokit } from "@octokit/core";
import { getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";
import { SimplifiedWorkspace } from ".";

const { orgName, authToken } = getPreferenceValues()

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
  if (name.length > 3) {
    // https://docs.github.com/en/rest?apiVersion=2022-11-28
    const result = await octokit.request('GET /search/repositories/', {
      q: `${name} in:name in:readme org:${orgName}`,
    });
    if (result?.data?.items.length > 0) {
      return result.data.items.map((item: RemoteRepo) => ({
            path: item.html_url,
            name: item.name,
            sshUrl: item.ssh_url,
            icon: 'https://github.com/github.png?size=32',
            openWith: `https://vscode.dev/github/${orgName}/${item.name}`
      }));
    }
  }
  return [];
}
