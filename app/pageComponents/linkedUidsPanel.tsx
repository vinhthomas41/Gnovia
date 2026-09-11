"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { LinkedUidRecord, ProfileState } from "@/lib/linkedUids";

interface passedData {
  userUid: string | null;
  linkedUids: LinkedUidRecord[];
  profiles: { [genshinUid: string]: ProfileState };
  onLinkUid: (genshinUid: string) => void;
  onUnlinkUid: (record: LinkedUidRecord) => void;
  onRefreshUid: (genshinUid: string) => void;
}

const UID_REGEX = /^\d{9}$/;

const LinkedUidsPanel: React.FC<passedData> = ({
  userUid,
  linkedUids,
  profiles,
  onLinkUid,
  onUnlinkUid,
  onRefreshUid,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newUidInput, setNewUidInput] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  // Only ticks while the panel is open — it's just driving the refresh countdown display.
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function linkUid() {
    setLinkError(null);
    const trimmed = newUidInput.trim();
    if (!UID_REGEX.test(trimmed)) {
      setLinkError("Enter a 9-digit Genshin UID.");
      return;
    }
    if (!userUid) {
      setLinkError("Still setting up your session — try again in a moment.");
      return;
    }
    if (linkedUids.some((record) => record.genshinUid === trimmed)) {
      setLinkError("That UID is already linked.");
      return;
    }
    onLinkUid(trimmed);
    setNewUidInput("");
  }

  function refreshSecondsRemaining(genshinUid: string): number {
    const profile = profiles[genshinUid];
    if (!profile || profile.status !== "loaded") return 0;
    const result = profile.result;
    if (!("cachedAt" in result)) return 0;
    const remainingMs = result.cachedAt + result.ttl * 1000 - now;
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }

  function describeProfile(profile: ProfileState | undefined): string {
    if (!profile || profile.status === "loading") return "Loading…";
    if (profile.status === "error") return profile.message;
    const result = profile.result;
    if ("error" in result) return result.error;
    if ("showcaseEmpty" in result) {
      return `${result.playerInfo?.nickname ?? "This player"}'s showcase is empty or private.`;
    }
    return `${result.playerInfo.nickname} — Lv ${result.playerInfo.level}`;
  }

  return (
    <>
      <button
        type="button"
        className="hover:bg-glow flex w-full cursor-pointer justify-center py-3 text-xs tracking-widest uppercase transition-colors hover:text-black"
        onClick={() => setIsOpen(true)}
      >
        Linked UIDs{linkedUids.length > 0 ? ` (${linkedUids.length})` : ""}
      </button>

      {isOpen &&
        createPortal(
          <div className="archive-uid-overlay" onClick={() => setIsOpen(false)}>
            <div
              className="archive-uid-dialog archive-panel text-white"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="linked-uids-title"
            >
              <div className="archive-panel-header flex items-center justify-between px-4 py-3">
                <p
                  id="linked-uids-title"
                  className="text-glow text-sm tracking-widest uppercase"
                >
                  Linked Genshin UIDs
                </p>
                <button
                  type="button"
                  className="archive-uid-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close linked UIDs"
                >
                  ×
                </button>
              </div>

              <form
                className="archive-uid-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  linkUid();
                }}
              >
                <input
                  className="archive-search flex-1 px-3 py-2 text-sm outline-none"
                  type="text"
                  placeholder="9-digit UID"
                  value={newUidInput}
                  onChange={(e) => setNewUidInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="border-glow hover:bg-glow border px-3 text-xs tracking-widest uppercase transition-colors hover:text-black"
                >
                  Link
                </button>
              </form>
              {linkError && (
                <p className="px-4 pb-2 text-xs text-red-400">{linkError}</p>
              )}

              <ul className="divide-glow/20 max-h-80 divide-y overflow-y-auto">
                {linkedUids.length === 0 && (
                  <li className="px-4 py-3 text-xs text-white/50">
                    No linked UIDs yet.
                  </li>
                )}
                {linkedUids.map((record) => {
                  const profile = profiles[record.genshinUid];
                  const remaining = refreshSecondsRemaining(record.genshinUid);
                  return (
                    <li key={record.docId} className="archive-uid-record">
                      <div className="archive-uid-record-row">
                        <span className="archive-uid-number">
                          {record.genshinUid}
                        </span>
                        <div className="archive-uid-actions">
                          <button
                            type="button"
                            className="border-glow/40 hover:bg-glow border px-2 py-1 text-xs tracking-widest uppercase transition-colors hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
                            disabled={
                              remaining > 0 || profile?.status === "loading"
                            }
                            onClick={() => onRefreshUid(record.genshinUid)}
                          >
                            {remaining > 0
                              ? `Refresh (${remaining}s)`
                              : "Refresh"}
                          </button>
                          <button
                            type="button"
                            className="border-glow/40 hover:bg-glow border px-2 py-1 text-xs tracking-widest uppercase transition-colors hover:text-black"
                            onClick={() => onUnlinkUid(record)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-white/60">
                        {describeProfile(profile)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default LinkedUidsPanel;
