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

const Sidebar: React.FC<passedData> = ({ charList, sendData, favorites, favoriteClick }) => {
  const [favoriteMode, setFavoriteMode] = useState<boolean>(false);

  return (
    <div className="min-h-screen w-60 overflow-y-auto border-r-4 border-white font-mono flex-shrink-0  [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-white" id="sidebar">
      <div
        className="sticky top-0 z-10 flex w-full cursor-pointer justify-center border-b-4 border-white bg-black py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        onClick={() => setFavoriteMode(!favoriteMode)}
      >
        {favoriteMode ? <>Favorites: on</> : <>Favorites: off</>}
      </div>
      <ul className="divide-y divide-white/20" id="sidebarList">
        {charList
          .filter((character) => (favoriteMode && favorites?.includes(character.name)) || !favoriteMode)
          .map((character) => (
            <li
              key={character.name}
              className="flex cursor-pointer items-center p-2 px-3 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-colors"
              onClick={() => sendData(character)}
            >
              {character.images.hoyowiki_icon ? (
                <Image src={character.images.hoyowiki_icon} alt={character.name} width={40} height={40} className="w-10 mr-2" />
              ) : (
                <div className="h-10 w-10 mr-2 border border-white/20" />
              )}
              {character.name}
              <div className="group relative ml-auto w-7">
                {!favorites!.includes(character.name) ? (
                  <>
                    <Image src={star.src} alt="star" className="absolute opacity-100 group-hover:opacity-0" width={28} height={28} onClick={() => favoriteClick(character)} />
                    <Image src={starS.src} alt="selected star" width={28} height={28} className="opacity-0 group-hover:opacity-100" />
                  </>
                ) : (
                  <Image src={starS.src} alt="selected star" width={28} height={28} onClick={() => favoriteClick(character)} />
                )}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;