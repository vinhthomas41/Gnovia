"use client";
import { useEffect, useState } from "react";
import Sidebar from "../pageComponents/sidebar";
import Maininfo from "../pageComponents/maininfo";
import genshindb from "genshin-db";
import "../globals.css";
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();

const charNames = genshindb.characters("names", { matchCategories: true });
const charArray: genshindb.Character[] = [];

for (const char of charNames) {
  charArray.push(genshindb.characters(char)!);
}
export default function Home() {
  const [currentChar, setCurrentChar] = useState<
    (typeof charArray)[number] | null
  >(null);
  const [favoriteList, setFavoriteList] = useState<string[]>([]);
  const [userUid, setUserUid] = useState<string | null>(null);

  useEffect(() => {
    signInAnonymously(auth).catch((error) =>
      console.error("Anonymous sign-in failed:", error),
    );
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const childCharacterChange = (newChar: genshindb.Character) => {
    setCurrentChar(newChar);
  };

  async function addFavorite(characterName: string) {
    console.log("Added");
    await addDoc(collection(db, "favorites"), {
      charId: characterName,
      uid: auth.currentUser!.uid,
    });
  }

  async function removeFavorite(characterName: string) {
    console.log("remove");
    const q = query(
      collection(db, "favorites"),
      where("charId", "==", characterName),
      where("uid", "==", auth.currentUser!.uid),
    );

    const snapshot = await getDocs(q);
    snapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  }

  useEffect(() => {
    async function loadFavorites() {
      const q = query(collection(db, "favorites"), where("uid", "==", userUid));
      const snapshot = await getDocs(q);
      const ids = snapshot.docs.map((doc) => doc.data().charId as string);
      setFavoriteList(ids);
    }
    loadFavorites();
  }, [userUid]);

  const favoriteEdit = (char: genshindb.Character) => {
    const newArray = [];
    const contained = favoriteList!.includes(char.name);
    if (contained) {
      const indexToRemove = favoriteList!.indexOf(char.name);
      for (let i: number = 0; i < favoriteList!.length; i++) {
        if (i != indexToRemove) {
          newArray.push(favoriteList![i]);
        }
      }
    } else {
      for (let i: number = 0; i < favoriteList!.length; i++) {
        newArray.push(favoriteList![i]);
      }
      newArray.push(char.name);
    }
    setFavoriteList(newArray);
    if (contained) {
      removeFavorite(char.name);
    } else {
      addFavorite(char.name);
    }
  };

  return (
    <div className="bg-blueTest text-textColor1 flex h-screen">
      <Sidebar
        charList={charArray}
        sendData={childCharacterChange}
        favorites={favoriteList}
        favoriteClick={favoriteEdit}
      />
      <Maininfo character={currentChar} />
    </div>
  );
}
