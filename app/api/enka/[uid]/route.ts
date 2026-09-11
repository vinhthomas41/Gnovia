import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import type { EnkaProfile } from "@/lib/enka";

// Enka asks for a descriptive User-Agent identifying the caller so they can reach out
// if something's misbehaving, instead of silently rate-limiting/blocking it.
const ENKA_USER_AGENT = "genshin-char-db/1.0 (contact: vinhthomas41@gmail.com)";

const UID_REGEX = /^\d{9}$/;

// firebase-admin requires the Node.js runtime. Declaring this explicitly also
// prevents a deployment adapter from moving this route to an Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

interface EnkaCacheDoc {
  data: EnkaProfile;
  ttl: number;
  cachedAt: Timestamp;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uid: string }> },
) {
  const { uid } = await params;

  if (!UID_REGEX.test(uid)) {
    return NextResponse.json(
      { error: "Invalid UID format. A Genshin UID must be 9 digits." },
      { status: 400 },
    );
  }

  // Reads/writes go through the Admin SDK (service account), which bypasses Firestore
  // rules entirely — this is what lets enkaCache deny all client-SDK access while
  // still working here. If credentials aren't configured yet, fail soft to a plain
  // live fetch (no caching) instead of crashing the request.
  let cacheRef: FirebaseFirestore.DocumentReference | undefined;
  try {
    cacheRef = getAdminDb().collection("enkaCache").doc(uid);
    const cacheSnap = await cacheRef.get();
    if (cacheSnap.exists) {
      const cached = cacheSnap.data() as EnkaCacheDoc;
      const cachedAtMs = cached.cachedAt?.toMillis?.() ?? 0;
      const ttlMs = (cached.ttl ?? 0) * 1000;
      if (cachedAtMs && Date.now() < cachedAtMs + ttlMs) {
        return NextResponse.json({
          ...cached.data,
          source: "cache",
          cachedAt: cachedAtMs,
        });
      }
    }
  } catch (err) {
    console.warn(`enkaCache read failed for ${uid}:`, err);
  }

  let response: Response;
  try {
    response = await fetch(`https://enka.network/api/uid/${uid}`, {
      headers: { "User-Agent": ENKA_USER_AGENT },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Enka Network." },
      { status: 502 },
    );
  }

  switch (response.status) {
    case 400:
      return NextResponse.json(
        { error: "Invalid UID format." },
        { status: 400 },
      );
    case 404:
      return NextResponse.json(
        { error: "No player found with that UID." },
        { status: 404 },
      );
    case 424:
      return NextResponse.json(
        {
          error:
            "Enka Network needs to update for the current game version, or the game is under maintenance.",
        },
        { status: 424 },
      );
    case 429:
      return NextResponse.json(
        {
          error: "Rate limited by Enka Network. Please wait before retrying.",
          retryAfterSeconds: 60,
        },
        { status: 429 },
      );
    case 500:
    case 503:
      return NextResponse.json(
        {
          error: "Enka Network is experiencing server issues. Try again later.",
        },
        { status: response.status },
      );
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        error: `Unexpected error from Enka Network (status ${response.status}).`,
      },
      { status: response.status },
    );
  }

  const raw: EnkaProfile = await response.json();
  const ttl = typeof raw.ttl === "number" ? raw.ttl : 60;
  const fetchedAt = Date.now();

  if (!raw.avatarInfoList || raw.avatarInfoList.length === 0) {
    return NextResponse.json({
      showcaseEmpty: true,
      playerInfo: raw.playerInfo,
      source: "live",
    });
  }

  try {
    await (cacheRef ?? getAdminDb().collection("enkaCache").doc(uid)).set({
      data: raw,
      ttl,
      cachedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn(`enkaCache write failed for ${uid}:`, err);
  }

  return NextResponse.json({ ...raw, source: "live", cachedAt: fetchedAt });
}
