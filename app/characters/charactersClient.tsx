"use client";

import { useEffect, useState } from "react";
import Sidebar from "../pageComponents/sidebar";
import Maininfo from "../pageComponents/maininfo";
import SiteNav from "../pageComponents/siteNav";
import type {
  ArchiveCharacter,
  ArchiveCharacterSummary,
  ArchiveItemNames,
} from "@/lib/archiveTypes";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { fetchEnkaProfile } from "@/lib/enka";
import type { LinkedUidRecord, ProfileState } from "@/lib/linkedUids";

const auth = getAuth();

interface CharactersClientProps {
  characters: ArchiveCharacterSummary[];
}

interface CharacterDetailResponse {
  characters: ArchiveCharacter[];
  itemNames: ArchiveItemNames;
}

export default function CharactersClient({
  characters,
}: CharactersClientProps) {
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
    null,
  );
  const [detailData, setDetailData] = useState<CharacterDetailResponse | null>(
    null,
  );
  const [detailError, setDetailError] = useState(false);
  const [favoriteList, setFavoriteList] = useState<string[]>([]);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [linkedUids, setLinkedUids] = useState<LinkedUidRecord[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileState>>({});

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/archive/characters", {
      cache: "force-cache",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Character details failed to load.");
        return response.json() as Promise<CharacterDetailResponse>;
      })
      .then(setDetailData)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setDetailError(true);
      });
    return () => controller.abort();
  }, []);

  const currentChar =
    detailData?.characters.find(
      (character) => character.id === selectedCharacterId,
    ) ?? null;

  useEffect(() => {
    signInAnonymously(auth).catch((error) =>
      console.error("Anonymous sign-in failed:", error),
    );
    return onAuthStateChanged(auth, (user) => {
      if (user) setUserUid(user.uid);
    });
  }, []);

  async function addFavorite(characterName: string) {
    await addDoc(collection(db, "favorites"), {
      charId: characterName,
      uid: auth.currentUser!.uid,
    });
  }

  async function removeFavorite(characterName: string) {
    const favoritesQuery = query(
      collection(db, "favorites"),
      where("charId", "==", characterName),
      where("uid", "==", auth.currentUser!.uid),
    );
    const snapshot = await getDocs(favoritesQuery);
    await Promise.all(snapshot.docs.map((favorite) => deleteDoc(favorite.ref)));
  }

  useEffect(() => {
    if (!userUid) return;
    async function loadFavorites() {
      const favoritesQuery = query(
        collection(db, "favorites"),
        where("uid", "==", userUid),
      );
      const snapshot = await getDocs(favoritesQuery);
      setFavoriteList(
        snapshot.docs.map((favorite) => favorite.data().charId as string),
      );
    }
    void loadFavorites();
  }, [userUid]);

  function favoriteEdit(character: ArchiveCharacterSummary) {
    const contained = favoriteList.includes(character.name);
    setFavoriteList((current) =>
      contained
        ? current.filter((name) => name !== character.name)
        : [...current, character.name],
    );
    void (contained
      ? removeFavorite(character.name)
      : addFavorite(character.name));
  }

  useEffect(() => {
    if (!userUid) {
      setLinkedUids([]);
      return;
    }
    async function loadLinkedUids() {
      const linkedQuery = query(
        collection(db, "linkedUids"),
        where("uid", "==", userUid),
      );
      const snapshot = await getDocs(linkedQuery);
      setLinkedUids(
        snapshot.docs.map((linked) => ({
          docId: linked.id,
          genshinUid: linked.data().genshinUid as string,
        })),
      );
    }
    void loadLinkedUids();
  }, [userUid]);

  async function loadProfile(genshinUid: string) {
    setProfiles((previous) => ({
      ...previous,
      [genshinUid]: { status: "loading" },
    }));
    try {
      const result = await fetchEnkaProfile(genshinUid);
      setProfiles((previous) => ({
        ...previous,
        [genshinUid]: { status: "loaded", result },
      }));
    } catch (error: unknown) {
      setProfiles((previous) => ({
        ...previous,
        [genshinUid]: {
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Couldn't reach the UID service.",
        },
      }));
    }
  }

  useEffect(() => {
    for (const { genshinUid } of linkedUids) {
      if (!profiles[genshinUid]) void loadProfile(genshinUid);
    }
    // Profiles are excluded because this effect only fills missing entries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedUids]);

  async function linkUid(genshinUid: string) {
    if (!userUid) return;
    const docRef = await addDoc(collection(db, "linkedUids"), {
      uid: userUid,
      genshinUid,
      addedAt: serverTimestamp(),
    });
    setLinkedUids((previous) => [
      ...previous,
      { docId: docRef.id, genshinUid },
    ]);
  }

  async function unlinkUid(record: LinkedUidRecord) {
    await deleteDoc(doc(db, "linkedUids", record.docId));
    setLinkedUids((previous) =>
      previous.filter((linked) => linked.docId !== record.docId),
    );
    setProfiles((previous) => {
      const next = { ...previous };
      delete next[record.genshinUid];
      return next;
    });
  }

  return (
    <div className="archive-database-shell archive-brutalist-type text-textColor1 relative flex h-screen flex-col overflow-hidden">
      <SiteNav />
      <div className="archive-database-body relative z-10 flex min-h-0 flex-1">
        <Sidebar
          charList={characters}
          sendData={(character) => setSelectedCharacterId(character.id)}
          favorites={favoriteList}
          favoriteClick={favoriteEdit}
          userUid={userUid}
          linkedUids={linkedUids}
          profiles={profiles}
          onLinkUid={linkUid}
          onUnlinkUid={unlinkUid}
          onRefreshUid={loadProfile}
        />
        <Maininfo
          character={currentChar}
          selectedCharacterName={
            characters.find((character) => character.id === selectedCharacterId)
              ?.name
          }
          detailsLoading={
            selectedCharacterId !== null && !detailData && !detailError
          }
          detailsError={detailError}
          linkedUids={linkedUids}
          profiles={profiles}
          itemNames={detailData?.itemNames ?? { weapons: {}, artifacts: {} }}
        />
      </div>
    </div>
  );
}
