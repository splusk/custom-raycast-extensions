import { Octokit } from "@octokit/core";
import { getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";

const { orgName, authToken } = getPreferenceValues()

const octokit = new Octokit({
  auth: authToken,
  request: {
    fetch: fetch,
  },
});

export interface Repo {
  html_url: string;
  name: string;
  icon: string;
  ssh_url: string;
}

export const getRepos = async (name: string) => {
  const result = await octokit.request('GET /search/repositories/', {
    q: `org:${orgName} in:name ${name}`,
  });
  if (result?.data?.items.length > 0) {
    return result.data.items;
  }
  return [];
}
