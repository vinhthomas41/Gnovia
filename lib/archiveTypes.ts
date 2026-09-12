export interface CharacterStatLine {
  level: number;
  ascension: number;
  hp?: number;
  attack?: number;
  defense?: number;
  specialized?: number;
}

export interface ArchiveTalent {
  name: string;
  description: string;
  attributes?: {
    labels: string[];
    parameters: Record<string, number[]>;
  };
}

export interface ArchiveConstellation {
  name: string;
  description: string;
}

export interface ArchiveCharacterSummary {
  id: number;
  name: string;
  elementType: string;
  elementText: string;
  images: {
    hoyowiki_icon?: string;
    gachaSplash?: string;
    rosterIcon?: string;
  };
}

export interface ArchiveCharacter extends ArchiveCharacterSummary {
  title: string;
  description: string;
  rarity: number;
  substatText: string;
  statsByLevel: CharacterStatLine[];
  talents: ArchiveTalent[];
  constellations: ArchiveConstellation[];
}

export interface ArchiveItemNames {
  weapons: Record<string, string>;
  artifacts: Record<string, string>;
}
