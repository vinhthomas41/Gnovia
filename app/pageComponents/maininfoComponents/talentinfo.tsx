import genshindb, { talents, CombatTalentDetail, PassiveTalentDetail } from 'genshin-db';
import { useState } from 'react';

interface passedData {
    character: genshindb.Character | null;
}

const talentinfo: React.FC<passedData> = ({character}) => {
  const charTalents =  talents(character!.name);
  const talentList: (CombatTalentDetail | PassiveTalentDetail | undefined)[]  | undefined = charTalents ?
  ([charTalents!.combat1, charTalents!.combat2, charTalents!.combat3, charTalents!.combatju, charTalents!.combatsp,
    charTalents!.passive1, charTalents!.passive2, charTalents!.passive3, charTalents!.passive4]) : undefined;
  const [openTalents, changeTalents] = useState<string[]> ([]);
  const talentEdit = (name: string) => {
      const newArray = [];
      const contained = openTalents.includes(name);
      if(contained) {
          const indexToRemove = openTalents.indexOf(name);
          for(let i = 0; i < openTalents.length; i++) {
          if(i != indexToRemove) {
            newArray.push(openTalents[i]);
          }
        }
      } else {
          for(let i = 0; i < openTalents.length; i++) {
            newArray.push(openTalents[i]);
          }
          newArray.push(name);
        }
      changeTalents(newArray);
  }

  function isCombat(talent: any): talent is CombatTalentDetail {
    return (talent as CombatTalentDetail).attributes !== undefined;
  }

  return(
  <div>
    {charTalents ? (
    <div className = 'rounded bg-blueTest2 ml-10 w-95 text-center drop-shadow-black drop-shadow-lg/50'>
      <ul>
        {talentList!
        .filter(talent => talent && talent.description)
        .map((talent, index) => (
          <li key = {index}>
            <div className=''>
              <div id='talentButton' onClick = {() => talentEdit(talent!.name)} className='mx-2 text-left hover:cursor-pointer flex flex-row'>
                {talent!.name}
                {openTalents.includes(talent!.name) ? <div className='ml-auto'>&#x23f6;</div> : <div className='ml-auto'>&#x23f7;</div>}
              </div>
              {openTalents.includes(talent!.name) ? (
                <div className='border-t-2'>
                  <p className='text-left px-2'>{talent!.description}</p>
                  {isCombat(talent) ? (
                    <p className='text-left px-2'>{talent.attributes.labels}</p>
                  ) : <></>}
                </div>
              ) : <></>}
            </div> 
          </li>
        ))}
      </ul>
    </div>
    ) :<></>}
  </div>  
  ) 
}

export default talentinfo;