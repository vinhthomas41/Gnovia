"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import LinkedUidsPanel from "./linkedUidsPanel";
import type { LinkedUidRecord, ProfileState } from "@/lib/linkedUids";
import type { ArchiveCharacterSummary } from "@/lib/archiveTypes";

interface PassedData {
  charList: ArchiveCharacterSummary[];
  sendData: (newChar: ArchiveCharacterSummary) => void;
  selectedCharacterId: number | null;
  favorites: string[] | null;
  favoriteClick: (char: ArchiveCharacterSummary) => void;
  userUid: string | null;
  linkedUids: LinkedUidRecord[];
  profiles: { [genshinUid: string]: ProfileState };
  onLinkUid: (genshinUid: string) => void;
  onUnlinkUid: (record: LinkedUidRecord) => void;
  onRefreshUid: (genshinUid: string) => void;
}

const Sidebar: React.FC<PassedData> = ({
  charList,
  sendData,
  selectedCharacterId,
  favorites,
  favoriteClick,
  userUid,
  linkedUids,
  profiles,
  onLinkUid,
  onUnlinkUid,
  onRefreshUid,
}) => {
  const [favoriteMode, setFavoriteMode] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const characterRefs = useRef(new Map<number, HTMLLIElement>());

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return charList
      .filter((character) => character.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(query);
        const bStarts = b.name.toLowerCase().startsWith(query);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 7);
  }, [charList, search]);

  const visibleCharacters = favoriteMode
    ? charList.filter((character) => favorites?.includes(character.name))
    : charList;

  useEffect(() => {
    if (selectedCharacterId === null) return;
    const frame = window.requestAnimationFrame(() => {
      characterRefs.current.get(selectedCharacterId)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedCharacterId, favoriteMode]);

  function chooseCharacter(
    character: ArchiveCharacterSummary,
    revealInRoster = false,
  ) {
    if (revealInRoster) setFavoriteMode(false);
    sendData(character);
    setSearch("");
    setSearchOpen(false);
    setActiveSuggestion(0);
  }

  function chooseSuggestion(index = activeSuggestion) {
    const character = suggestions[index] ?? suggestions[0];
    if (character) chooseCharacter(character, true);
  }

  return (
    <aside className="archive-sidebar archive-character-roster" id="sidebar">
      <div className="archive-sidebar-tools">
        <div className="archive-character-search">
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              chooseSuggestion();
            }}
          >
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              placeholder="Find character…"
              autoComplete="off"
              role="combobox"
              aria-label="Search characters"
              aria-autocomplete="list"
              aria-expanded={searchOpen && suggestions.length > 0}
              aria-controls="character-search-results"
              aria-activedescendant={
                searchOpen && suggestions[activeSuggestion]
                  ? `character-option-${suggestions[activeSuggestion].id}`
                  : undefined
              }
              onFocus={() => setSearchOpen(true)}
              onBlur={() => window.setTimeout(() => setSearchOpen(false), 100)}
              onChange={(event) => {
                setSearch(event.target.value);
                setSearchOpen(true);
                setActiveSuggestion(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveSuggestion((value) =>
                    Math.min(value + 1, suggestions.length - 1),
                  );
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveSuggestion((value) => Math.max(value - 1, 0));
                }
                if (event.key === "Escape") setSearchOpen(false);
              }}
            />
          </form>

          {searchOpen && search.trim() && (
            <ul
              className="archive-character-suggestions"
              id="character-search-results"
              role="listbox"
            >
              {suggestions.length > 0 ? (
                suggestions.map((character, index) => (
                  <li
                    key={character.id}
                    id={`character-option-${character.id}`}
                    role="option"
                    aria-selected={index === activeSuggestion}
                  >
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => chooseCharacter(character, true)}
                    >
                      {character.images.rosterIcon && (
                        <Image
                          src={character.images.rosterIcon}
                          alt=""
                          width={36}
                          height={36}
                          unoptimized
                        />
                      )}
                      <span>{character.name}</span>
                      {favorites?.includes(character.name) && (
                        <i aria-label="Favorite">★</i>
                      )}
                    </button>
                  </li>
                ))
              ) : (
                <li className="archive-search-empty">No character found.</li>
              )}
            </ul>
          )}
        </div>

        <button
          type="button"
          className={`archive-filter-toggle ${favoriteMode ? "is-active" : ""}`}
          onClick={() => setFavoriteMode((current) => !current)}
          aria-pressed={favoriteMode}
        >
          <span aria-hidden="true">★</span>
          {favoriteMode ? "Showing favorites" : "Show favorites"}
        </button>

        <LinkedUidsPanel
          userUid={userUid}
          linkedUids={linkedUids}
          profiles={profiles}
          onLinkUid={onLinkUid}
          onUnlinkUid={onUnlinkUid}
          onRefreshUid={onRefreshUid}
        />
      </div>

      <ul
        className="archive-sidebar-list archive-themed-scrollbar"
        id="sidebarList"
      >
        {visibleCharacters.map((character) => {
          const isFavorite = favorites?.includes(character.name) ?? false;
          return (
            <li
              key={character.name}
              ref={(node) => {
                if (node) characterRefs.current.set(character.id, node);
                else characterRefs.current.delete(character.id);
              }}
              className={`archive-sidebar-item ${selectedCharacterId === character.id ? "is-selected" : ""}`}
              onClick={() => chooseCharacter(character)}
            >
              <div className="archive-character-icon">
                {character.images.rosterIcon ? (
                  <Image
                    src={character.images.rosterIcon}
                    alt={character.name}
                    width={64}
                    height={64}
                    unoptimized
                  />
                ) : (
                  <span aria-hidden="true">◇</span>
                )}
              </div>
              <span className="archive-character-name">{character.name}</span>
              <button
                type="button"
                className={`archive-favorite-button ${isFavorite ? "is-favorite" : ""}`}
                onClick={(event) => {
                  event.stopPropagation();
                  favoriteClick(character);
                }}
                aria-label={
                  isFavorite
                    ? `Remove ${character.name} from favorites`
                    : `Add ${character.name} to favorites`
                }
                aria-pressed={isFavorite}
              >
                {isFavorite ? "★" : "☆"}
              </button>
            </li>
          );
        })}
        {visibleCharacters.length === 0 && (
          <li className="archive-roster-empty">
            No favorites yet. Select the star on a character to add one.
          </li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
