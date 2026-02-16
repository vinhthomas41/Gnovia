"use client";
import React, {useState} from 'react';
import genshindb from 'genshin-db';
import starS from '../../public/selectedStar.png';
import star from '../../public/Star.png';

interface passedData {
    charList: genshindb.Character[];
    sendData: (newChar: genshindb.Character) => void;
    favorites: string[] | null;
    favoriteClick: (char: genshindb.Character) => void;
}

const sidebar: React.FC<passedData> = ({charList, sendData, favorites, favoriteClick}) => {
  const[favoriteMode, setFavoriteMode] = useState<boolean>(false);

  return(
      <div className = "border-r-2 border-white w-60 min-h-screen overflow-y-auto" id = "sidebar">
        <div
          className='flex justify-center border-2 w-full cursor-pointer py-3 rounded-lg'
          onClick={() => setFavoriteMode(!favoriteMode)}
        >
          Favorite
        </div>
        <ul className = "space-y-4" id = "sidebarList">
          {charList
          .filter(character => ((favoriteMode && favorites?.includes(character.name)) || (!favoriteMode)))
          .map((character) => (
            <li
              key = {character.name}
              className = "p-2 cursor-pointer rounded flex items-center px-5  "
              onClick = {() => sendData(character)}
            >
              <img src = {character.images.hoyowiki_icon}  alt = {character.images.hoyowiki_icon} className="w-14"/>
              {character.name}
              <div className='relative group w-7 ml-auto'>
                {(!favorites!.includes(character.name) ? (
                <>
                  <img 
                    src = {star.src} 
                    className='absolute opacity-100 group-hover:opacity-0' 
                    onClick={() => favoriteClick(character)}/>
                  <img 
                    src = {starS.src} 
                    className='opacity-0 group-hover:opacity-100 onClick:opacity-0' 
                  />
                </>
                ) : (
                  <img 
                    src = {starS.src} 
                    onClick={() => favoriteClick(character)}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
    </div>
  )
}
export default sidebar;