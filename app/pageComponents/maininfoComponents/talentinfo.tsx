import genshindb, { talents, CombatTalentDetail, PassiveTalentDetail } from "genshin-db";
import { useState } from "react";

interface passedData {
  character: genshindb.Character | null;
}

const Talentinfo: React.FC<passedData> = ({ character }) => {
  const charTalents = talents(character!.name);
  const talentList: (CombatTalentDetail | PassiveTalentDetail | undefined)[] | undefined = charTalents
    ? [charTalents.combat1, charTalents.combat2, charTalents.combat3, charTalents.combatju, charTalents.combatsp, charTalents.passive1, charTalents.passive2, charTalents.passive3, charTalents.passive4]
    : undefined;

  const [openTalents, changeTalents] = useState<string[]>([]);

  const talentEdit = (name: string) => {
    const newArray = [];
    const contained = openTalents.includes(name);
    if (contained) {
      const indexToRemove = openTalents.indexOf(name);
      for (let i = 0; i < openTalents.length; i++) {
        if (i != indexToRemove) newArray.push(openTalents[i]);
      }
    } else {
      for (let i = 0; i < openTalents.length; i++) newArray.push(openTalents[i]);
      newArray.push(name);
    }
    changeTalents(newArray);
  };

  function isCombat(talent: CombatTalentDetail | PassiveTalentDetail | undefined): talent is CombatTalentDetail {
    return (talent as CombatTalentDetail).attributes !== undefined;
  }

  function formatText(text: string) {
    return text.split("**").map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  }

  return (
    <div>
      {charTalents ? (
        <div className="border-4 border-white w-80">
          <div className="border-b-4 border-white px-4 py-2">
            <p className="text-xs uppercase tracking-widest text-white/50">Talents</p>
          </div>
          <ul className="divide-y divide-white/20">
            {talentList!
              .filter((talent) => talent && talent.description)
              .map((talent, index) => (
                <li key={index}>
                  <div
                    onClick={() => talentEdit(talent!.name)}
                    className="flex flex-row px-4 py-2 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    {talent!.name}
                    <span className="ml-auto">{openTalents.includes(talent!.name) ? "▲" : "▼"}</span>
                  </div>
                  {openTalents.includes(talent!.name) && (
                    <div className="border-t border-white/20 px-4 py-2">
                      <p className="text-xs text-white/70">{formatText(talent!.description)}</p>
                      {isCombat(talent) && <p className="text-xs text-white/50 mt-2">{talent.attributes.labels}</p>}
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </div>
      ) : <></>}
    </div>
  );
};

export default Talentinfo;