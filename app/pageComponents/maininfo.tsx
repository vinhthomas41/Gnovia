import Image from "next/image";
import React, { useState } from "react";
import Talentinfo from "./maininfoComponents/talentinfo";
import Constellationinfo from "./maininfoComponents/constellationinfo";
import BuildInfo from "./maininfoComponents/buildinfo";
import { findBuildMatches } from "@/lib/enkaBuildMatch";
import { getCombatTalentLevels } from "@/lib/enkaSkillSlots";
import type { LinkedUidRecord, ProfileState } from "@/lib/linkedUids";
import type { ArchiveCharacter, ArchiveItemNames } from "@/lib/archiveTypes";

interface PassedData {
  character: ArchiveCharacter | null;
  linkedUids: LinkedUidRecord[];
  profiles: { [genshinUid: string]: ProfileState };
  itemNames: ArchiveItemNames;
  selectedCharacterName?: string;
  detailsLoading?: boolean;
  detailsError?: boolean;
}

type CharacterSection = "attributes" | "talents" | "constellations" | "build";

const Maininfo: React.FC<PassedData> = ({
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
  const [activeSection, setActiveSection] =
    useState<CharacterSection>("attributes");

  const [prevCharacterId, setPrevCharacterId] = useState(character?.id);
  if (character?.id !== prevCharacterId) {
    setPrevCharacterId(character?.id);
    setSelectedBuildIndex(0);
    setActiveSection("attributes");
  }

  function changeLevel(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (value === "") {
      setCurrentLevel("");
      return;
    }
    setCurrentLevel(Math.min(100, Math.max(1, Number(value))));
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

  if (detailsLoading) {
    return (
      <main className="archive-detail character-menu-loading" id="mainInfo">
        <div className="archive-detail-status" role="status">
          <span className="archive-detail-spinner" aria-hidden="true" />
          Loading {selectedCharacterName}’s records…
        </div>
      </main>
    );
  }

  if (detailsError && selectedCharacterName) {
    return (
      <main className="archive-detail character-menu-loading" id="mainInfo">
        <div
          className="archive-detail-status archive-detail-error"
          role="alert"
        >
          Couldn’t load {selectedCharacterName}’s records. Refresh to try again.
        </div>
      </main>
    );
  }

  if (!character) {
    return (
      <main className="archive-detail character-menu-loading" id="mainInfo">
        <h2>Choose a character.</h2>
      </main>
    );
  }

  const sections: Array<{
    id: CharacterSection;
    label: string;
    note: string;
    disabled?: boolean;
  }> = [
    { id: "attributes", label: "Attributes", note: `Level ${displayLevel}` },
    {
      id: "talents",
      label: "Talents",
      note: `${character.talents.length} entries`,
    },
    {
      id: "constellations",
      label: "Constellations",
      note:
        unlockedConstellations === undefined
          ? "Archive record"
          : `${unlockedConstellations} / 6 unlocked`,
    },
    {
      id: "build",
      label: "Equipment",
      note: matches.length > 0 ? "Weapon & artifacts" : "Link a UID",
      disabled: matches.length === 0,
    },
  ];

  return (
    <main className="archive-detail character-menu" id="mainInfo">
      <div className="character-menu-heading">
        <p>{character.elementText}</p>
        <span aria-hidden="true">/</span>
        <h1>{character.name}</h1>
      </div>

      <div className="character-menu-stage">
        <nav
          className="character-section-nav"
          aria-label="Character information"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? "is-active" : ""}
              disabled={section.disabled}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="character-section-diamond" aria-hidden="true" />
              <strong>{section.label}</strong>
              <small>{section.note}</small>
            </button>
          ))}
        </nav>

        <section
          className="character-splash"
          aria-label={`${character.name} artwork`}
        >
          <div className="character-splash-sigil" aria-hidden="true" />
          {character.images.gachaSplash ? (
            <Image
              src={character.images.gachaSplash}
              alt={`${character.name} splash art`}
              fill
              priority
              sizes="(max-width: 800px) 80vw, 42vw"
              className="character-splash-image"
              unoptimized
            />
          ) : character.images.hoyowiki_icon ? (
            <Image
              src={character.images.hoyowiki_icon}
              alt={character.name}
              width={320}
              height={320}
              className="character-splash-fallback"
            />
          ) : null}
          <div className="character-splash-caption">
            <span>{"★".repeat(character.rarity)}</span>
            <p>{character.title || character.description}</p>
          </div>
        </section>

        <section className="character-menu-content" aria-live="polite">
          {activeSection === "attributes" && (
            <div className="archive-panel character-attributes-panel">
              <div className="archive-panel-header">
                <div>
                  <p>{character.elementText}</p>
                  <h2>{character.name}</h2>
                </div>
                <label>
                  Level
                  <input
                    className="archive-inline-input"
                    type="number"
                    value={currentLevel}
                    onChange={changeLevel}
                    aria-label="Character level"
                  />
                </label>
              </div>
              <ul className="character-stat-list">
                <li>
                  <span>Max HP</span>
                  <strong>{stats?.hp?.toFixed(0) ?? "—"}</strong>
                </li>
                <li>
                  <span>ATK</span>
                  <strong>{stats?.attack?.toFixed(0) ?? "—"}</strong>
                </li>
                <li>
                  <span>DEF</span>
                  <strong>{stats?.defense?.toFixed(0) ?? "—"}</strong>
                </li>
                <li>
                  <span>{character.substatText}</span>
                  <strong>{stats?.specialized ?? "—"}</strong>
                </li>
              </ul>
              <div className="character-description">
                <p>{character.description}</p>
              </div>
            </div>
          )}

          {activeSection === "talents" && (
            <Talentinfo
              key={`talent-${character.name}-${selectedMatch ? "build" : "nobuild"}`}
              character={character}
              talentLevelDefaults={talentLevelDefaults}
            />
          )}

          {activeSection === "constellations" && (
            <Constellationinfo
              key={`constellation-${character.name}`}
              character={character}
              unlockedCount={unlockedConstellations}
            />
          )}

          {activeSection === "build" && matches.length > 0 && (
            <BuildInfo
              key={`build-${character.name}`}
              character={character}
              matches={matches}
              selectedIndex={selectedBuildIndex}
              onSelectIndex={setSelectedBuildIndex}
              itemNames={itemNames}
            />
          )}
        </section>
      </div>
    </main>
  );
};

export default Maininfo;
