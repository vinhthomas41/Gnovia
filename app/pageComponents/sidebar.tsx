"use client";
import React, { useState } from "react";
import starS from "../../public/selectedStar.png";
import star from "../../public/Star.png";
import Image from "next/image";
import LinkedUidsPanel from "./linkedUidsPanel";
import type { LinkedUidRecord, ProfileState } from "@/lib/linkedUids";
import type { ArchiveCharacterSummary } from "@/lib/archiveTypes";

interface passedData {
  charList: ArchiveCharacterSummary[];
  sendData: (newChar: ArchiveCharacterSummary) => void;
  favorites: string[] | null;
  favoriteClick: (char: ArchiveCharacterSummary) => void;
  userUid: string | null;
  linkedUids: LinkedUidRecord[];
  profiles: { [genshinUid: string]: ProfileState };
  onLinkUid: (genshinUid: string) => void;
  onUnlinkUid: (record: LinkedUidRecord) => void;
  onRefreshUid: (genshinUid: string) => void;
}

const Sidebar: React.FC<passedData> = ({
  charList,
  sendData,
  favorites,
  favoriteClick,
  userUid,
  linkedUids,
  profiles,
  onLinkUid,
  onUnlinkUid,
  onRefreshUid,
}) => {
  const [favoriteMode, setFavoriteMode] = useState<boolean>(false);

  return (
    <aside
      className="archive-sidebar [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-glow h-full w-64 flex-shrink-0 overflow-y-auto [&::-webkit-scrollbar]:w-1"
      id="sidebar"
    >
      <div className="archive-sidebar-tools sticky top-0 z-10">
        <div
          className={`archive-filter-toggle flex w-full cursor-pointer justify-center py-3 text-xs tracking-widest uppercase transition-colors ${favoriteMode ? "is-active" : ""}`}
          onClick={() => setFavoriteMode(!favoriteMode)}
        >
          {favoriteMode ? <>Favorites: on</> : <>Favorites: off</>}
        </div>
        <LinkedUidsPanel
          userUid={userUid}
          linkedUids={linkedUids}
          profiles={profiles}
          onLinkUid={onLinkUid}
          onUnlinkUid={onUnlinkUid}
          onRefreshUid={onRefreshUid}
        />
      </div>
      <ul className="archive-sidebar-list" id="sidebarList">
        {charList
          .filter(
            (character) =>
              (favoriteMode && favorites?.includes(character.name)) ||
              !favoriteMode,
          )
          .map((character) => (
            <li
              key={character.name}
              className="archive-sidebar-item flex cursor-pointer items-center p-2 px-3 text-sm tracking-wide transition-colors"
              onClick={() => sendData(character)}
            >
              {character.images.hoyowiki_icon ? (
                <Image
                  src={character.images.hoyowiki_icon}
                  alt={character.name}
                  width={40}
                  height={40}
                  className="mr-2 w-10"
                />
              ) : (
                <div className="border-glow/20 mr-2 h-10 w-10 border" />
              )}
              {character.name}
              <div className="group relative ml-auto w-7">
                {!favorites!.includes(character.name) ? (
                  <>
                    <Image
                      src={star.src}
                      alt="star"
                      className="absolute opacity-100 group-hover:opacity-0"
                      width={28}
                      height={28}
                      onClick={() => favoriteClick(character)}
                    />
                    <Image
                      src={starS.src}
                      alt="selected star"
                      width={28}
                      height={28}
                      className="opacity-0 group-hover:opacity-100"
                    />
                  </>
                ) : (
                  <Image
                    src={starS.src}
                    alt="selected star"
                    width={28}
                    height={28}
                    onClick={() => favoriteClick(character)}
                  />
                )}
              </div>
            </li>
          ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
