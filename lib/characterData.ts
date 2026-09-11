import "server-only";

import genshindb from "genshin-db";
import type {
  ArchiveCharacter,
  ArchiveCharacterSummary,
  ArchiveConstellation,
  ArchiveItemNames,
  ArchiveTalent,
} from "@/lib/archiveTypes";

function getTalents(name: string): ArchiveTalent[] {
  const data = genshindb.talents(name);
  if (!data) return [];
  return [
    data.combat1,
    data.combat2,
    data.combat3,
    data.combatju,
    data.combatsp,
    data.passive1,
    data.passive2,
    data.passive3,
    data.passive4,
  ]
    .filter((talent): talent is NonNullable<typeof talent> =>
      Boolean(talent?.description),
    )
    .map((talent) => ({
      name: talent.name,
      description: talent.description,
      ...(Object.hasOwn(talent, "attributes")
        ? {
            attributes: (talent as typeof data.combat1).attributes,
          }
        : {}),
    }));
}

function getConstellations(name: string): ArchiveConstellation[] {
  const data = genshindb.constellations(name);
  if (!data) return [];
  return [data.c1, data.c2, data.c3, data.c4, data.c5, data.c6].map(
    ({ name: constellationName, description }) => ({
      name: constellationName,
      description,
    }),
  );
}

export function getArchiveCharacters(): ArchiveCharacter[] {
  const names = genshindb.characters("names", { matchCategories: true }) ?? [];
  return names.flatMap((name) => {
    const character = genshindb.characters(name);
    if (!character) return [];
    return [
      {
        id: character.id,
        name: character.name,
        description: character.description,
        substatText: character.substatText,
        elementType: character.elementType,
        images: { hoyowiki_icon: character.images.hoyowiki_icon },
        statsByLevel: Array.from({ length: 100 }, (_, index) =>
          character.stats(index + 1, "+"),
        ),
        talents: getTalents(character.name),
        constellations: getConstellations(character.name),
      },
    ];
  });
}

export function getArchiveItemNames(): ArchiveItemNames {
  const weapons: Record<string, string> = {};
  const artifacts: Record<string, string> = {};

  for (const name of genshindb.weapons("names", { matchCategories: true }) ??
    []) {
    const weapon = genshindb.weapons(name);
    if (weapon) weapons[String(weapon.id)] = weapon.name;
  }
  for (const name of genshindb.artifacts("names", { matchCategories: true }) ??
    []) {
    const artifact = genshindb.artifacts(name);
    if (artifact) artifacts[String(artifact.id)] = artifact.name;
  }

  return { weapons, artifacts };
}

export function getArchiveCharacterSummaries(): ArchiveCharacterSummary[] {
  const names = genshindb.characters("names", { matchCategories: true }) ?? [];
  return names.flatMap((name) => {
    const character = genshindb.characters(name);
    return character
      ? [
          {
            id: character.id,
            name: character.name,
            images: { hoyowiki_icon: character.images.hoyowiki_icon },
          },
        ]
      : [];
  });
}
