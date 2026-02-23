import React, { useState } from "react";
import genshindb from "genshin-db";
import Talentinfo from "./maininfoComponents/talentinfo";
interface passedData {
  character: genshindb.Character | null;
}

const Maininfo: React.FC<passedData> = ({ character }) => {
  const [currentLevel, setCurrentLevel] = useState<number | string>(100);

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

  return (
    <div
      className="max-w-screen overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      id="mainInfo"
    >
      {!character ? (
        <h2>Choose a character.</h2>
      ) : (
        <>
          <div
            id="quote"
            className="bg-blueTest2 mx-20 my-10 w-200 items-center justify-center rounded p-7 drop-shadow-lg/50 drop-shadow-black"
          >
            <h1 className="text-center">{`"${character.description}"`}</h1>
          </div>
          <div id="boxes" className="flex flex-row items-start">
            <div className="bg-blueTest2 ml-20 w-95 rounded text-center drop-shadow-lg/50 drop-shadow-black">
              <h1 className="font-bold">
                Stats - Lvl{" "}
                <input
                  className="bg-blueTest2 w-15"
                  type="number"
                  value={currentLevel}
                  onChange={changeLevel}
                ></input>
              </h1>
              <ul>
                <li className="border-t">
                  HP: {character.stats(displayLevel, "+").hp}
                </li>
                <li className="border-t">
                  ATK: {character.stats(displayLevel, "+").attack}
                </li>
                <li className="border-t">
                  DEF: {character.stats(displayLevel, "+").defense}
                </li>
                <li className="border-t">
                  {character.substatText}:{" "}
                  {character.stats(displayLevel, "+").specialized}
                </li>
              </ul>
            </div>
            <Talentinfo character={character}></Talentinfo>
          </div>
        </>
      )}
    </div>
  );
};

export default Maininfo;
