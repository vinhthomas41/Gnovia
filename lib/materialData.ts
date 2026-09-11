import "server-only";

import genshindb from "genshin-db";
import type { MaterialInfo, MaterialSummary } from "@/lib/materialInfo";

export function getAllMaterials(): MaterialInfo[] {
  const names = genshindb.materials("names", { matchCategories: true }) ?? [];
  const seenIds = new Set<number>();
  const materials: MaterialInfo[] = [];
  for (const name of names) {
    const material = genshindb.materials(name) as unknown as
      | MaterialInfo
      | undefined;
    if (material && !seenIds.has(material.id)) {
      seenIds.add(material.id);
      materials.push(material);
    }
  }
  return materials;
}

export function getMaterialSummaries(): MaterialSummary[] {
  return getAllMaterials().map(
    ({ id, name, dupealias, sortRank, category, typeText, images }) => ({
      id,
      name,
      dupealias,
      sortRank,
      category,
      typeText,
      images,
    }),
  );
}
