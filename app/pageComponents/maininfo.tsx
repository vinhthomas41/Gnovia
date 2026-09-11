import React, { useState } from "react";
import Talentinfo from "./maininfoComponents/talentinfo";
import Constellationinfo from "./maininfoComponents/constellationinfo";
import BuildInfo from "./maininfoComponents/buildinfo";
import { findBuildMatches } from "@/lib/enkaBuildMatch";
import { getCombatTalentLevels } from "@/lib/enkaSkillSlots";
import type { LinkedUidRecord, ProfileState } from "@/lib/linkedUids";
import type { ArchiveCharacter, ArchiveItemNames } from "@/lib/archiveTypes";

interface passedData {
  character: ArchiveCharacter | null;
  linkedUids: LinkedUidRecord[];
  profiles: { [genshinUid: string]: ProfileState };
  itemNames: ArchiveItemNames;
  selectedCharacterName?: string;
  detailsLoading?: boolean;
  detailsError?: boolean;
}

const Maininfo: React.FC<passedData> = ({
  character,
  linkedUids,
  profiles,
  itemNames,
  selectedCharacterName,
  detailsLoading,
  detailsError,
}) => {
  const [currentLevel, setCurrentLevel] = useState<number | string>(100);
  const [selectedBuildIndex, setSelectedBuildIndex] = useState(0);

  // Reset the selected build tab when the character changes, without an Effect
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [prevCharacterId, setPrevCharacterId] = useState(character?.id);
  if (character?.id !== prevCharacterId) {
    setPrevCharacterId(character?.id);
    setSelectedBuildIndex(0);
  }

  function changeLevel(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (value == "") {
      setCurrentLevel("");
      return;
    }
    const current = Number(value);
    if (current < 1) {
      setCurrentLevel(1);
    } else if (current > 100) {
      setCurrentLevel(100);
    } else {
      setCurrentLevel(current);
    }
  }

  const displayLevel = currentLevel === "" ? 1 : Number(currentLevel);

  const matches = character
    ? findBuildMatches(character, linkedUids, profiles)
    : [];
  const selectedMatch =
    matches[Math.min(selectedBuildIndex, matches.length - 1)];
  const talentLevelDefaults = selectedMatch
    ? getCombatTalentLevels(
        selectedMatch.avatar.avatarId,
        selectedMatch.avatar.skillDepotId,
        selectedMatch.avatar.skillLevelMap,
      )
    : undefined;
  const unlockedConstellations = selectedMatch?.avatar.talentIdList?.length;
  const stats = character?.statsByLevel[displayLevel - 1];

  return (
    <main
      className="archive-detail max-w-screen overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      id="mainInfo"
    >
      {detailsLoading ? (
        <div className="archive-detail-status" role="status">
          <span className="archive-detail-spinner" aria-hidden="true" />
          Loading {selectedCharacterName}’s records…
        </div>
      ) : detailsError && selectedCharacterName ? (
        <div
          className="archive-detail-status archive-detail-error"
          role="alert"
        >
          Couldn’t load {selectedCharacterName}’s records. Refresh to try again.
        </div>
      ) : !character ? (
        <h2 className="p-8 text-xs tracking-widest text-white/50 uppercase">
          Choose a character.
        </h2>
      ) : (
        <>
          <div className="archive-quote archive-panel mx-8 my-8 p-6">
            <h1 className="text-center text-sm text-white/70 italic">{`"${character.description}"`}</h1>
          </div>
          <div
            id="boxes"
            className="archive-card-grid flex flex-row items-start gap-6 px-8"
          >
            <div className="archive-panel w-80">
              <div className="archive-panel-header px-4 py-3">
                <h1 className="text-glow text-xs tracking-widest uppercase">
                  Stats — Lvl{" "}
                  <input
                    className="archive-inline-input w-12 text-center outline-none"
                    type="number"
                    value={currentLevel}
                    onChange={changeLevel}
                  />
                </h1>
              </div>
              <ul className="archive-data-list">
                <li className="flex justify-between px-4 py-2 text-sm">
                  <span className="text-xs text-white/50 uppercase">HP</span>
                  {stats?.hp?.toFixed(2)}
                </li>
                <li className="flex justify-between px-4 py-2 text-sm">
                  <span className="text-xs text-white/50 uppercase">ATK</span>
                  {stats?.attack?.toFixed(2)}
                </li>
                <li className="flex justify-between px-4 py-2 text-sm">
                  <span className="text-xs text-white/50 uppercase">DEF</span>
                  {stats?.defense?.toFixed(2)}
                </li>
                <li className="flex justify-between px-4 py-2 text-sm">
                  <span className="text-xs text-white/50 uppercase">
                    {character.substatText}
                  </span>
                  {stats?.specialized}
                </li>
              </ul>
            </div>
            <Talentinfo
              key={`talent-${character.name}-${selectedMatch ? "build" : "nobuild"}`}
              character={character}
              talentLevelDefaults={talentLevelDefaults}
            />
            <Constellationinfo
              key={`constellation-${character.name}`}
              character={character}
              unlockedCount={unlockedConstellations}
            />
          </div>
          {matches.length > 0 && (
            <BuildInfo
              key={`build-${character.name}`}
              character={character}
              matches={matches}
              selectedIndex={selectedBuildIndex}
              onSelectIndex={setSelectedBuildIndex}
              itemNames={itemNames}
            />
          )}
        </>
      )}
    </main>
  );
};

export default Maininfo;
