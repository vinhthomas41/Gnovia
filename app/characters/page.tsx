import CharactersClient from "@/app/characters/charactersClient";
import { getArchiveCharacterSummaries } from "@/lib/characterData";

export default function CharactersPage() {
  return <CharactersClient characters={getArchiveCharacterSummaries()} />;
}
