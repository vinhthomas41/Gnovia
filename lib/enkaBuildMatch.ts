import type { EnkaAvatarInfo } from "./enka";
import type { LinkedUidRecord, ProfileState } from "./linkedUids";
import type { ArchiveCharacter } from "./archiveTypes";

export interface CharacterBuildMatch {
  genshinUid: string;
  nickname: string;
  avatar: EnkaAvatarInfo;
}

export function findBuildMatches(
  character: ArchiveCharacter,
  linkedUids: LinkedUidRecord[],
  profiles: { [genshinUid: string]: ProfileState },
): CharacterBuildMatch[] {
  const matches: CharacterBuildMatch[] = [];
  for (const { genshinUid } of linkedUids) {
    const profile = profiles[genshinUid];
    if (!profile || profile.status !== "loaded") continue;
    const result = profile.result;
    if (!("avatarInfoList" in result) || !result.avatarInfoList) continue;
    for (const avatar of result.avatarInfoList) {
      if (avatar.avatarId === character.id) {
        matches.push({
          genshinUid,
          nickname: result.playerInfo.nickname,
          avatar,
        });
      }
    }
  }
  return matches;
}
