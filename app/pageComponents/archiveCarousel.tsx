"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type ArchiveSection = {
  title: string;
  eyebrow: string;
  description: string;
  href?: string;
  icon: ReactNode;
};

const iconClassName = "h-full w-full";

const SECTIONS: ArchiveSection[] = [
  {
    title: "Characters",
    eyebrow: "",
    description: "Heroes, talents, constellations, and builds",
    href: "/characters",
    icon: (
      <svg viewBox="0 0 120 120" className={iconClassName} aria-hidden="true">
        <path d="M60 16c-12 0-22 9-22 22 0 8 4 15 10 19-17 6-29 21-30 41h84c-1-20-13-35-30-41 6-4 10-11 10-19 0-13-10-22-22-22Z" />
        <path d="M35 88c8-9 16-14 25-14s17 5 25 14M48 43c7 5 17 5 24 0" />
      </svg>
    ),
  },
  {
    title: "Materials",
    eyebrow: "Resource Archive",
    description: "Ascension items, ingredients, and sources",
    href: "/materials",
    icon: (
      <svg viewBox="0 0 120 120" className={iconClassName} aria-hidden="true">
        <path d="M33 53 54 31l33 13 7 37-27 23-36-13-5-26 7-12Z" />
        <path d="m54 31 13 30 27 20M26 65l41-4 20-17M67 61v43" />
        <circle cx="54" cy="31" r="5" />
        <circle cx="26" cy="65" r="5" />
        <circle cx="94" cy="81" r="5" />
      </svg>
    ),
  },
  {
    title: "Weapons",
    eyebrow: "Sealed Archive",
    description: "A collection awaiting restoration",
    icon: (
      <svg viewBox="0 0 120 120" className={iconClassName} aria-hidden="true">
        <path d="m79 18 17 6-9 38-42 42-13-13 42-42 5-31Z" />
        <path d="m54 71 15 15M29 88l-9 9 8 8 9-9M75 49l12 13" />
      </svg>
    ),
  },
  {
    title: "Artifacts",
    eyebrow: "Sealed Archive",
    description: "A collection awaiting restoration",
    icon: (
      <svg viewBox="0 0 120 120" className={iconClassName} aria-hidden="true">
        <path d="M60 14 73 42l31 4-23 21 6 31-27-15-27 15 6-31-23-21 31-4 13-28Z" />
        <circle cx="60" cy="61" r="14" />
      </svg>
    ),
  },
  {
    title: "Guides",
    eyebrow: "Sealed Archive",
    description: "A collection awaiting restoration",
    icon: (
      <svg viewBox="0 0 120 120" className={iconClassName} aria-hidden="true">
        <path d="M18 29c17-7 31-3 42 7 11-10 25-14 42-7v65c-17-7-31-3-42 7-11-10-25-14-42-7V29Z" />
        <path d="M60 36v65M30 48c8-2 15 0 21 4M30 63c8-2 15 0 21 4M69 52c6-4 13-6 21-4M69 67c6-4 13-6 21-4" />
      </svg>
    ),
  },
];

function wrappedDistance(index: number, selected: number) {
  let distance = index - selected;
  const half = Math.floor(SECTIONS.length / 2);
  if (distance > half) distance -= SECTIONS.length;
  if (distance < -half) distance += SECTIONS.length;
  return distance;
}

function MagicCircle() {
  return (
    <svg
      className="archive-magic-circle"
      viewBox="0 0 1200 310"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <ellipse cx="600" cy="164" rx="565" ry="125" />
      <ellipse cx="600" cy="164" rx="500" ry="100" />
      <ellipse cx="600" cy="164" rx="340" ry="62" />
      <path d="M35 164h1130M600 39v250M108 93l984 142M108 235 1092 93M275 58l650 212M275 270 925 58" />
      <path d="m600 66 64 98-64 98-64-98 64-98ZM424 109l176 55-176 55M776 109l-176 55 176 55" />
    </svg>
  );
}

function OpenBook({ disabled }: { disabled: boolean }) {
  return (
    <svg viewBox="0 0 260 104" aria-hidden="true">
      <defs>
        <linearGradient id="page-glow" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#dffaff" stopOpacity=".8" />
          <stop offset="1" stopColor="#70bfff" stopOpacity=".15" />
        </linearGradient>
      </defs>
      <path
        className="book-fill"
        d="M18 25c43-10 78-4 112 20 34-24 69-30 112-20l-12 65c-37-7-69-1-100 13-31-14-63-20-100-13L18 25Z"
      />
      <path d="M18 25c43-10 78-4 112 20 34-24 69-30 112-20l-12 65c-37-7-69-1-100 13-31-14-63-20-100-13L18 25Z" />
      <path d="M130 45v58M30 37c37-6 68 0 93 17M237 37c-37-6-68 0-93 17" />
      {!disabled && (
        <path
          className="book-spark"
          d="m130 10 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z"
        />
      )}
    </svg>
  );
}

export default function ArchiveCarousel() {
  const router = useRouter();
  const [selected, setSelected] = useState(0);
  const current = SECTIONS[selected];

  function move(direction: number) {
    setSelected(
      (value) => (value + direction + SECTIONS.length) % SECTIONS.length,
    );
  }

  function enterSection() {
    if (current.href) router.push(current.href);
  }

  useEffect(() => {
    router.prefetch("/characters");
    router.prefetch("/materials");
  }, [router]);

  useEffect(() => {
    if (!current.href) return;
    const detailUrl = `/api/archive${current.href}`;
    const warmCache = () => {
      void fetch(detailUrl, { cache: "force-cache" })
        .then((response) => response.arrayBuffer())
        .catch(() => undefined);
    };
    const preloadTimer = window.setTimeout(warmCache, 350);
    return () => window.clearTimeout(preloadTimer);
  }, [current.href]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        setSelected((value) => (value - 1 + SECTIONS.length) % SECTIONS.length);
      }
      if (event.key === "ArrowRight") {
        setSelected((value) => (value + 1) % SECTIONS.length);
      }
      if (event.key === "Enter" && current.href) router.push(current.href);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current.href, router]);

  return (
    <main className="archive-landing">
      <div className="archive-rays" aria-hidden="true" />
      <header className="archive-header">
        <div className="archive-brand">
          <span className="archive-brand-mark" aria-hidden="true">
            ✦
          </span>
          <div>
            <p>Gnovia</p>
            <h1>Archive</h1>
          </div>
        </div>
        <p className="archive-stat"></p>
      </header>

      <section className="archive-picker" aria-label="Archive collections">
        <p className="archive-kicker">Choose a collection</p>
        <div className="archive-carousel-stage">
          {SECTIONS.map((section, index) => {
            const distance = wrappedDistance(index, selected);
            const active = distance === 0;
            const style = { "--archive-position": distance } as CSSProperties;
            return (
              <button
                key={section.title}
                type="button"
                className={`archive-orbit-item ${active ? "is-selected" : ""} ${Math.abs(distance) === 2 ? "is-far" : ""} ${section.href ? "" : "is-locked"}`}
                style={style}
                onClick={() => (active ? enterSection() : setSelected(index))}
                aria-current={active ? "true" : undefined}
                aria-label={`${section.title}${section.href ? "" : ", coming soon"}`}
              >
                <span className="archive-icon-ring">
                  <span className="archive-icon">{section.icon}</span>
                  {!section.href && <span className="archive-lock">◇</span>}
                </span>
                <span className="archive-side-label">{section.title}</span>
              </button>
            );
          })}
        </div>
        <div className="archive-selection-copy" aria-live="polite">
          <p>{current.eyebrow}</p>
          <h2>{current.title}</h2>
          <span>{current.description}</span>
        </div>
      </section>

      <div className="archive-ground" aria-hidden="true">
        <MagicCircle />
      </div>
      <div className="archive-book-wrap">
        <button
          type="button"
          className="archive-book-button"
          onClick={enterSection}
          disabled={!current.href}
          aria-label={
            current.href
              ? `Open ${current.title}`
              : `${current.title} is coming soon`
          }
        >
          <OpenBook disabled={!current.href} />
          <span>{current.href ? "Open collection" : "Collection sealed"}</span>
        </button>
      </div>
      <div className="archive-controls" aria-label="Carousel controls">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Previous collection"
        >
          ‹
        </button>
        <span>Navigate</span>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Next collection"
        >
          ›
        </button>
      </div>
    </main>
  );
}
