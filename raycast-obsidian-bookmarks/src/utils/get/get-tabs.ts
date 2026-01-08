import { BrowserExtension } from "@raycast/api";

const URLS_TO_EXCLUDE = [
  "chrome://newtab/",
  "chrome://extensions/",
  "chrome://settings/",
  "chrome://history/",
  "chrome://downloads/",
  "chrome://bookmarks/",
  "https://chatgpt.com/",
  "https://outlook.office.com/calendar/"
];

export const getBrowserTabsSorted = async(searchText?: string) => {
  try {
    const openTabs = (await BrowserExtension.getTabs()).filter(tab => {
      const url = tab.url || ""
      return !URLS_TO_EXCLUDE.some(prefix => url.startsWith(prefix))
    });
    let filteredList = Array.from(new Map(openTabs.map(item => [item.title, item])).values());
    filteredList = filteredList.filter((i, idx, arr) => !i.active || idx === arr.findIndex(a => a.active))

    if (searchText) {
      filteredList = filteredList.filter((tab) => {
        return tab.title?.toLowerCase().includes(searchText?.toLowerCase())
      });
    }
    const t = filteredList.sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0));
    return t;
  } catch (error: any) {
    console.log(error)
    return [];
  }
}