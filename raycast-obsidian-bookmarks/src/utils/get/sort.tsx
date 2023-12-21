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

export const getPopularityScore = async (entry: string | undefined, initialValue: number) => {
  return entry && entry.includes(",") ? Number(entry.split(',')[1]) + 100 : initialValue;
}

const sortByTitle = (files: File[]) => {
  return Promise.resolve(files.sort((a, b) => a.attributes.title.localeCompare(b.attributes.title)));
};

const sortByPopularity = async (files: File[]) => {
  const getByPopularity = async (files: File[]) => {
    return await Promise.all(files.map(async (value) => {
      const entry = await LocalStorage.getItem<string>(value.fileName);
      const score = await getPopularityScore(entry, 0);
      return {
        popularityScore: Number(score),
        ...value
      }
    }));
  }
  const sortedByDateFirst = await sortByLastUsed(files);
  const results = await getByPopularity(sortedByDateFirst);
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