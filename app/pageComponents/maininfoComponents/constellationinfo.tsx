import { useState } from "react";
import type { ArchiveCharacter } from "@/lib/archiveTypes";

interface passedData {
  character: ArchiveCharacter | null;
  unlockedCount?: number;
}

const Constellationinfo: React.FC<passedData> = ({
  character,
  unlockedCount,
}) => {
  const constellationList = character?.constellations ?? [];

  const [openConstellations, changeConstellations] = useState<string[]>([]);

  const constellationEdit = (name: string) => {
    const newArray = [];
    const contained = openConstellations.includes(name);
    if (contained) {
      const indexToRemove = openConstellations.indexOf(name);
      for (let i = 0; i < openConstellations.length; i++) {
        if (i != indexToRemove) newArray.push(openConstellations[i]);
      }
    } else {
      for (let i = 0; i < openConstellations.length; i++)
        newArray.push(openConstellations[i]);
      newArray.push(name);
    }
    changeConstellations(newArray);
  };

  function formatText(text: string) {
    return text
      .split("**")
      .map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
  }

  return (
    <div>
      {constellationList.length > 0 ? (
        <div className="archive-panel w-80">
          <div className="archive-panel-header px-4 py-3">
            <p className="text-glow text-xs tracking-widest uppercase">
              Constellations
            </p>
          </div>
          <ul className="archive-accordion">
            {constellationList.map((constellation, index) => {
              const unlocked =
                unlockedCount !== undefined && index < unlockedCount;
              const locked = unlockedCount !== undefined && !unlocked;
              return (
                <li key={index}>
                  <div
                    onClick={() => constellationEdit(constellation.name)}
                    className={`archive-accordion-trigger flex cursor-pointer flex-row px-4 py-3 text-sm tracking-wide transition-colors ${locked ? "text-white/30" : ""}`}
                  >
                    {`C${index + 1} — ${constellation.name}`}
                    {unlocked && (
                      <span className="text-glow ml-2 text-xs">(Unlocked)</span>
                    )}
                    {locked && (
                      <span className="ml-2 text-xs text-white/30">
                        (Locked)
                      </span>
                    )}
                    <span className="ml-auto">
                      {openConstellations.includes(constellation.name)
                        ? "▲"
                        : "▼"}
                    </span>
                  </div>
                  {openConstellations.includes(constellation.name) && (
                    <div className="archive-accordion-body px-4 py-3">
                      <p className="text-xs text-white/70">
                        {formatText(constellation.description)}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Constellationinfo;
