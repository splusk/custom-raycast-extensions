import { List, LocalStorage, getPreferenceValues } from "@raycast/api";
import { File } from "../files";

export const sortModes = ["lastUsed", "title", "popularity"];
export type SortMode = typeof sortModes[number];

export default function SortDropdown(props: { sortModes: SortMode[]; onChange: (newValue: string) => void }) {
  const { sortModes, onChange } = props;
  
  const buildTitle = (sortMode: SortMode) => {
    return sortMode.replace(/([A-Z])/g, ' $1')
    // uppercase the first character
    .replace(/^./, function(str){ return str.toUpperCase(); })
  }

  return (
    <List.Dropdown
      tooltip="Sort By"
      storeValue={true}
      onChange={(newValue) => {
        onChange(newValue);
      }}
    >
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
  
export const sortFilesByPref = async (files: File[]) => {
  const sortMode = await getSortMode();
  switch (sortMode) {
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
  const sortedByLasteViewed = await sortByLastViewed(files);
  return Promise.resolve(sortedByLasteViewed.sort((a, b) => {
    const rankA = a.attributes.rank || 0;
    const rankB = b.attributes.rank || 0;
    return rankB - rankA;
  }));
};
const sortByTitle = (files: File[]) => {
  return Promise.resolve(files.sort((a, b) => a.attributes.title.localeCompare(b.attributes.title)));
};