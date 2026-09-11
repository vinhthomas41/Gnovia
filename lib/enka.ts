// Types below reflect the actual shape of https://enka.network/api/uid/{uid} as of 2026,
// verified by fetching a real public showcase and inspecting the raw JSON — Enka's field
// names are terse and only loosely documented by the community.

export interface EnkaPropValue {
  type: number;
  ival: string;
  val?: string;
}

export interface EnkaReliquarySubstat {
  appendPropId: string;
  statValue: number;
}

export interface EnkaEquipFlat {
  nameTextMapHash: string;
  rankLevel: number;
  itemType: "ITEM_WEAPON" | "ITEM_RELIQUARY";
  icon: string;
  equipType?: string; // reliquary slot, e.g. "EQUIP_BRACER"
  setId?: number;
  setNameTextMapHash?: string;
  reliquaryMainstat?: { mainPropId: string; statValue: number };
  reliquarySubstats?: EnkaReliquarySubstat[];
  weaponStats?: { appendPropId: string; statValue: number }[];
}

export interface EnkaEquip {
  itemId: number;
  flat: EnkaEquipFlat;
  // present on artifacts
  reliquary?: {
    level: number;
    mainPropId: number;
    appendPropIdList: number[];
  };
  // present on weapons
  weapon?: {
    level: number;
    promoteLevel?: number;
    affixMap?: { [skillId: string]: number }; // weapon refinement rank, keyed by affix id
  };
}

export interface EnkaAvatarInfo {
  avatarId: number;
  // keyed by numeric prop type. Known keys: 4001 = level, 1002 = ascension (promoteLevel).
  propMap: { [type: string]: EnkaPropValue };
  talentIdList?: number[]; // unlocked constellation ids
  fightPropMap: { [fightPropId: string]: number }; // final computed stats, pre-calculated by Enka
  skillDepotId: number;
  inherentProudSkillList?: number[];
  skillLevelMap: { [skillId: string]: number }; // talent levels, keyed by internal skill id (not combat1/2/3)
  proudSkillExtraLevelMap?: { [proudSkillGroupId: string]: number }; // constellation talent-level bonuses (e.g. C3/C5)
  equipList: EnkaEquip[];
}

export interface EnkaPlayerInfo {
  nickname: string;
  level: number;
  signature?: string;
  worldLevel?: number;
  nameCardId?: number;
  finishAchievementNum?: number;
  towerFloorIndex?: number;
  towerLevelIndex?: number;
}

export interface EnkaProfile {
  playerInfo: EnkaPlayerInfo;
  avatarInfoList?: EnkaAvatarInfo[];
  ttl: number;
  uid: string;
}

export type EnkaApiResult =
  // cachedAt (ms epoch) marks when this data was fetched from Enka — combine with
  // ttl (seconds) to know when a manual refresh should be allowed again.
  | (EnkaProfile & { source: "live" | "cache"; cachedAt: number })
  | {
      showcaseEmpty: true;
      playerInfo?: EnkaPlayerInfo;
      source: "live" | "cache";
    }
  | { error: string; retryAfterSeconds?: number };

// Calls our own proxy route (app/api/enka/[uid]/route.ts), which handles Enka's rate
// limiting, status codes, and Firestore caching server-side.
export async function fetchEnkaProfile(uid: string): Promise<EnkaApiResult> {
  const response = await fetch(`/api/enka/${uid}`);
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      "The UID service returned an invalid response. Please try again after the site redeploys.",
    );
  }

  return response.json() as Promise<EnkaApiResult>;
}
