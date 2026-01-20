import React, { useState } from 'react'
import genshindb from 'genshin-db';
import Talentinfo from './maininfoComponents/talentinfo';
interface passedData {
    character: genshindb.Character | null;
}

const maininfo: React.FC<passedData> = ({character}) => {
  const [currentLevel, setCurrentLevel] = useState(100);

  function changeLevel(event: { target: { value: any; }; }) {
    let current = event.target.value;
    if(current < 1) {
      setCurrentLevel(1);
    } else if (current > 100) {
      setCurrentLevel(100);
    } else {
      setCurrentLevel(current);
    }
  }
  return (
      <div className = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-w-screen  overflow-y-auto" id = "mainInfo">
        {(!character ? (
          <h2>Choose a character.</h2>
        ) : (
          <>
            <div id = 'quote' className='items-center justify-center my-10 p-7 mx-20 drop-shadow-black drop-shadow-lg/50 rounded bg-blueTest2 w-200'>
              <h1 className='text-center'>"{character.description}"</h1>
            </div>
            <div id='boxes' className='flex items-start flex-row'>          
              <div className = 'rounded bg-blueTest2 ml-20 w-95 text-center drop-shadow-black drop-shadow-lg/50'>
                <h1 className='font-bold'>Stats - Lvl <input  className = 'bg-blueTest2 w-15' type = "number" value = {currentLevel} onChange = {changeLevel}></input></h1>
                <ul>
                  <li className='border-t'>HP: {character.stats(currentLevel, '+').hp}</li>
                  <li className='border-t'>ATK: {character.stats(currentLevel, '+').attack}</li>
                  <li className='border-t'>DEF: {character.stats(currentLevel, '+').defense}</li>
                  <li className='border-t'>{character.substatText}: {character.stats(currentLevel, '+').specialized}</li>
                </ul>
              </div>
              <Talentinfo character = {character}></Talentinfo>
            </div>
          </>
        )) }
    </div>
  )
}

export default maininfo;