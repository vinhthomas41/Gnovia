import { useState } from "react";
import type { CombatTalentLevelDefaults } from "@/lib/enkaSkillSlots";
import type { ArchiveCharacter, ArchiveTalent } from "@/lib/archiveTypes";

interface passedData {
  character: ArchiveCharacter | null;
  talentLevelDefaults?: CombatTalentLevelDefaults;
}

// Talent label templates look like "1-Hit DMG|{param1:F1P}" — the part after "|" holds
// {paramKey:FORMAT} tokens referencing attributes.parameters[paramKey][level-1].
// Formats seen in the data: "I" (integer), "P" (percent), "F<n>" (fixed decimals), and "F<n>P" (percent with decimals).
function substituteTalentParams(
  label: string,
  parameters: { [key: string]: number[] },
  level: number,
) {
  return label.replace(
    /\{(\w+):([A-Za-z0-9]+)\}/g,
    (_match, paramKey: string, format: string) => {
      const series = parameters[paramKey];
      const raw = series ? series[level - 1] : undefined;
      if (raw === undefined) return "?";
      if (format === "I") return String(Math.round(raw));
      const isPercent = format.includes("P");
      const decimalsMatch = format.match(/F(\d)/);
      const decimals = decimalsMatch ? Number(decimalsMatch[1]) : 0;
      const scaled = Number((isPercent ? raw * 100 : raw).toFixed(decimals));
      return isPercent ? `${scaled}%` : String(scaled);
    },
  );
}

const Talentinfo: React.FC<passedData> = ({
  character,
  talentLevelDefaults,
}) => {
  const talentList = character?.talents ?? [];

  const [openTalents, changeTalents] = useState<string[]>([]);
  const [talentLevels, setTalentLevels] = useState<{
    [name: string]: number | string;
  }>(() => {
    // Seed the level selector from a linked build's actual talent levels, when one exists,
    // instead of always defaulting to 1.
    const initial: { [name: string]: number } = {};
    if (talentList.length >= 3 && talentLevelDefaults) {
      if (talentLevelDefaults.combat1 !== undefined)
        initial[talentList[0].name] = talentLevelDefaults.combat1;
      if (talentLevelDefaults.combat2 !== undefined)
        initial[talentList[1].name] = talentLevelDefaults.combat2;
      if (talentLevelDefaults.combat3 !== undefined)
        initial[talentList[2].name] = talentLevelDefaults.combat3;
    }
    return initial;
  });

  const changeTalentLevel = (
    name: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    if (value == "") {
      setTalentLevels({ ...talentLevels, [name]: "" });
      return;
    }
    const current = Number(value);
    if (current < 1) {
      setTalentLevels({ ...talentLevels, [name]: 1 });
    } else if (current > 15) {
      setTalentLevels({ ...talentLevels, [name]: 15 });
    } else {
      setTalentLevels({ ...talentLevels, [name]: current });
    }
  };

  const displayTalentLevel = (name: string) => {
    const level = talentLevels[name];
    return level === undefined || level === "" ? 1 : Number(level);
  };

  const talentEdit = (name: string) => {
    const newArray = [];
    const contained = openTalents.includes(name);
    if (contained) {
      const indexToRemove = openTalents.indexOf(name);
      for (let i = 0; i < openTalents.length; i++) {
        if (i != indexToRemove) newArray.push(openTalents[i]);
      }
    } else {
      for (let i = 0; i < openTalents.length; i++)
        newArray.push(openTalents[i]);
      newArray.push(name);
    }
    changeTalents(newArray);
  };

  function isCombat(talent: ArchiveTalent): talent is ArchiveTalent & {
    attributes: NonNullable<ArchiveTalent["attributes"]>;
  } {
    return talent.attributes !== undefined;
  }

  function formatText(text: string) {
    return text
      .split("**")
      .map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
  }

  return (
    <div>
      {talentList.length > 0 ? (
        <div className="archive-panel w-80">
          <div className="archive-panel-header px-4 py-3">
            <p className="text-glow text-xs tracking-widest uppercase">
              Talents
            </p>
          </div>
          <ul className="archive-accordion">
            {talentList.map((talent, index) => (
              <li key={index}>
                <div
                  onClick={() => talentEdit(talent.name)}
                  className="archive-accordion-trigger flex cursor-pointer flex-row px-4 py-3 text-sm tracking-wide transition-colors"
                >
                  {talent.name}
                  <span className="ml-auto">
                    {openTalents.includes(talent.name) ? "▲" : "▼"}
                  </span>
                </div>
                {openTalents.includes(talent.name) && (
                  <div className="archive-accordion-body px-4 py-3">
                    <p className="text-xs text-white/70">
                      {formatText(talent.description)}
                    </p>
                    {isCombat(talent) && (
                      <div className="mt-2">
                        <p className="text-xs tracking-widest text-white/50 uppercase">
                          Talent Lvl{" "}
                          <input
                            className="archive-inline-input w-10 text-center tracking-normal normal-case outline-none"
                            type="number"
                            value={talentLevels[talent.name] ?? 1}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => changeTalentLevel(talent.name, e)}
                          />
                        </p>
                        <ul className="divide-glow/10 mt-2 divide-y">
                          {talent.attributes.labels.map((label, i) => {
                            const substituted = substituteTalentParams(
                              label,
                              talent.attributes.parameters,
                              displayTalentLevel(talent.name),
                            );
                            const [title, value] = substituted.split("|");
                            return (
                              <li
                                key={i}
                                className="flex justify-between py-1 text-xs text-white/50"
                              >
                                <span>{title}</span>
                                <span className="text-white/70">{value}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Talentinfo;
