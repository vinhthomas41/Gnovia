"use client";
import React, { useState } from "react";
import genshindb from "genshin-db";
import starS from "../../public/selectedStar.png";
import star from "../../public/Star.png";
import Image from "next/image";
interface passedData {
  charList: genshindb.Character[];
  sendData: (newChar: genshindb.Character) => void;
  favorites: string[] | null;
  favoriteClick: (char: genshindb.Character) => void;
}

const Sidebar: React.FC<passedData> = ({
  charList,
  sendData,
  favorites,
  favoriteClick,
}) => {
  const [favoriteMode, setFavoriteMode] = useState<boolean>(false);

  return (
    <div
      className="min-h-screen w-60 overflow-y-auto border-r-2 border-white"
      id="sidebar"
    >
      <div
        className="bg-blueTest2 sticky top-0 z-10 flex w-full cursor-pointer justify-center rounded-lg border-2 py-3"
        onClick={() => setFavoriteMode(!favoriteMode)}
      >
        {favoriteMode ? <>Favorites: on</> : <>Favorites: off</>}
      </div>
      <ul className="space-y-4" id="sidebarList">
        {charList
          .filter(
            (character) =>
              (favoriteMode && favorites?.includes(character.name)) ||
              !favoriteMode,
          )
          .map((character) => (
            <li
              key={character.name}
              className="flex cursor-pointer items-center rounded p-2 px-5"
              onClick={() => sendData(character)}
            >
              {character.images.hoyowiki_icon ? (
                <Image
                  src={character.images.hoyowiki_icon}
                  alt={character.name}
                  width={56}
                  height={56}
                  className="w-14"
                />
              ) : (
                <div className="h-14 w-14 rounded bg-gray-700" />
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
                      className="onClick:opacity-0 opacity-0 group-hover:opacity-100"
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
    </div>
  );
};
export default Sidebar;
