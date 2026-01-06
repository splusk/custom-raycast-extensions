import { List, LocalStorage, getPreferenceValues } from "@raycast/api";
import { File } from "../files";

export enum SORT_MODES {
  ALL = "all",
  LASTUSED = "lastUsed",
  TITLE = "title",
  POPULARITY = "popularity",
  SAVED = "saved",
  CHROME = "chrome",
}
export const sortModes = [SORT_MODES.ALL, SORT_MODES.LASTUSED, SORT_MODES.TITLE, SORT_MODES.POPULARITY, SORT_MODES.SAVED, SORT_MODES.CHROME];
export type SortMode = typeof sortModes[number];

export type VaultMode = string;

export const getVaultModes = (): string[] => {
  const { vaultNames } = getPreferenceValues<{ vaultNames: string }>();
  return vaultNames.split(',').map(name => name.trim()).filter(name => name.length > 0);
};

export default function SortDropdown(props: {
  sortModes: SortMode[];
  vaultModes: VaultMode[];
  onChange: (newValue: string) => void;
}) {
  const { sortModes, vaultModes, onChange } = props;

  const buildTitle = (mode: string) => {
    return mode
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function(str){ return str.toUpperCase(); })
      .replace('Path', '');
  }

  return (
    <List.Dropdown
      tooltip="Sort By"
      storeValue={true}
      onChange={(newValue) => {
        onChange(newValue);
      }}
    >
      <List.Dropdown.Section title="Vaults">
        {vaultModes.map((vaultMode) => (
          <List.Dropdown.Item key={vaultMode} title={vaultMode} value={vaultMode} />
        ))}
      </List.Dropdown.Section>
      <List.Dropdown.Section title="Sort By">
        {sortModes.map((sortMode) => (
          <List.Dropdown.Item key={sortMode} title={buildTitle(sortMode)} value={sortMode} />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}

export const setSortMode = async (sortMode: SortMode) => {
    LocalStorage.setItem("obsidian-bookmarks-sort-mode", sortMode);
}

export const getSortMode = async () => {
  let sortMode = await LocalStorage.getItem("obsidian-bookmarks-sort-mode");
  if (!sortMode) {
    const { sortOrder } = getPreferenceValues<Preferences>();
    await LocalStorage.setItem("obsidian-bookmarks-sort-mode", sortOrder);
    sortMode = sortOrder;
  }
  return sortMode;
}

export const setVaultMode = async (vaultMode: VaultMode) => {
    LocalStorage.setItem("obsidian-bookmarks-vault-mode", vaultMode);
}

export const getVaultMode = async (): Promise<VaultMode> => {
  let vaultMode = await LocalStorage.getItem("obsidian-bookmarks-vault-mode");
  if (!vaultMode) {
    const vaultModes = getVaultModes();
    const defaultVault = vaultModes.length > 0 ? vaultModes[0] : '';
    await LocalStorage.setItem("obsidian-bookmarks-vault-mode", defaultVault);
    vaultMode = defaultVault;
  }
  return vaultMode as VaultMode;
}

export const getCurrentVaultName = async (): Promise<string> => {
  return await getVaultMode();
}

export const sortFilesByPref = async (files: File[]) => {
  const sortMode = await getSortMode();
  switch (sortMode) {
    case "all":
    case "lastUsed":
      return sortByLastViewed(files);
    case "popularity":
      return sortByRank(files);
    case "title":
    default:
      return sortByTitle(files);
  }
}

const sortByLastViewed = (files: File[]) => {
  return Promise.resolve(files.sort((a, b) => {
    const viewedLastA = a.attributes.updated || a.attributes.created || a.attributes.saved;
    const viewedLastADate = viewedLastA ? new Date(viewedLastA) : new Date();
    const viewedLastB = b.attributes.updated || b.attributes.created || b.attributes.saved;
    const viewedLastBDate = viewedLastB ? new Date(viewedLastB) : new Date();
    return viewedLastBDate.getTime() - viewedLastADate.getTime();
  }));
};
const sortByRank = async (files: File[]) => {
  const sortedByLastViewed = await sortByLastViewed(files);
  return Promise.resolve(sortedByLastViewed.sort((a, b) => {
    const rankA = a.attributes.rank || 0;
    const rankB = b.attributes.rank || 0;
    return rankB - rankA;
  }));
};
const sortByTitle = (files: File[]) => {
  return Promise.resolve(files.sort((a, b) => a.attributes.title.localeCompare(b.attributes.title)));
};
