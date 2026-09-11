// genshin-db's bundled Material type (node_modules/genshin-db/types/folders/materials.d.ts)
// doesn't match the actual runtime shape: it declares `source: string[]` but the real
// field is `sources`, and it's missing `dropDomainId`/`dropDomainName`/`daysOfWeek`
// entirely even though real domain materials return them. This type reflects what a
// material object actually contains, verified against real entries (e.g. "Afterglow of
// Long Night Flint", a domain-drop weapon ascension material with all three fields set).
export interface MaterialSummary {
  id: number;
  name: string;
  dupealias?: string;
  sortRank: number;
  category: string;
  typeText?: string;
  images: { filename_icon: string };
}

export interface MaterialInfo extends MaterialSummary {
  rarity?: 1 | 2 | 3 | 4 | 5;
  description: string;
  dropDomainId?: number;
  dropDomainName?: string;
  daysOfWeek?: string[];
  sources: string[];
  version: string;
}

// Same public icon CDN convention used across genshin-db consumers, keyed by the
// game's internal icon filename (verified: UI_ItemIcon_112138.png, UI_ItemIcon_105002.png,
// and character/weapon icon filenames all resolve here too).
export function materialIconUrl(filename: string): string {
  return `https://gi.yatta.moe/assets/UI/${filename}.png`;
}

const UNCATEGORIZED_LABEL = "Uncategorized";

export function materialGroupLabel(material: MaterialSummary): string {
  return material.typeText?.trim() || UNCATEGORIZED_LABEL;
}

export interface MaterialGroup {
  label: string;
  materials: MaterialSummary[];
}

export function groupMaterialsByType(
  materials: MaterialSummary[],
): MaterialGroup[] {
  const groups = new Map<string, MaterialSummary[]>();
  for (const material of materials) {
    const label = materialGroupLabel(material);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(material);
  }

  const sortedGroups = [...groups.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
  for (const [, list] of sortedGroups) {
    list.sort(
      (a, b) => a.sortRank - b.sortRank || a.name.localeCompare(b.name),
    );
  }
  return sortedGroups.map(([label, list]) => ({ label, materials: list }));
}
