import { List, LocalStorage, getPreferenceValues } from "@raycast/api";
import { File, formatDate } from "../files";

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
    await LocalStorage.setItem("obsidian-bookmarks-sort-mode", sortMode);
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
  
export const getSortFunc = async () => {
  const sortMode = await getSortMode();
  switch (sortMode) {
    case "lastUsed":
      return sortByLastUsed;
    case "popularity":
        return sortByPopularity;
    case "title":
    default:
      return sortByTitle;
  }
}

export const getPopularityScoreBasedOnDate = async (file: File, multiplier = 1) => {
  const aDate = await LocalStorage.getItem<string>(file.fileName);
  if (aDate) {
    return getDateScore(aDate) * multiplier;
  }
  const savedDate = new Date(file.attributes.saved);
  return getDateScore(formatDate(savedDate)) * multiplier;
}

const sortByTitle = (files: File[]) => {
  return Promise.resolve(files.sort((a, b) => a.attributes.title.localeCompare(b.attributes.title)));
};

const sortByPopularity = async (files: File[]) => {
  const getByPopularity = async () => {
    return await Promise.all(files.map(async (value) => {
      const popularity = await LocalStorage.getItem<string>(`${value.fileName}-pop`);
      const popularityScore = popularity ? parseInt(popularity) : await getPopularityScoreBasedOnDate(value);
      return {
        popularityScore,
        ...value
      }
    }));
  }
  const results = await getByPopularity();
  return results.sort((a, b) => {
    return b.popularityScore - a.popularityScore;
  });
};
  
const sortByLastUsed = async (files: File[]) => {
  const getLastUsedDates = async () => {
    return await Promise.all(files.map(async (value) => {
      const aDate = await LocalStorage.getItem<string>(value.fileName);
      const lastOpened = aDate ? new Date(aDate) : new Date(value.attributes.saved);
      return {
        lastOpened,
        ...value
      }
    }));
  }

  const results = await getLastUsedDates();
  return results.sort((a, b) => {
    return b.lastOpened.getTime() - a.lastOpened.getTime();
  });
};

const getDateScore = (date: string): number => {
  return parseInt(date.split("T")[0].replace(/-/g, ""));
}