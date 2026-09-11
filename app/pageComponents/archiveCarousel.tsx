"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "./themeSwitcher";

type ArchiveSection = {
  title: string;
  index: string;
  description: string;
  record: string;
  href?: string;
  icon: ReactNode;
};

const iconClassName = "h-full w-full";

const SECTIONS: ArchiveSection[] = [
  {
    title: "Characters",
    index: "Archive 01",
    description: "Heroes, talents, constellations, and field builds.",
    record: "Playable roster",
    href: "/characters",
    icon: (
      <svg viewBox="0 0 120 120" className={iconClassName} aria-hidden="true">
        <path d="M60 18c-12 0-21 9-21 21 0 8 4 15 10 19-17 5-29 20-31 40h84c-2-20-14-35-31-40 6-4 10-11 10-19 0-12-9-21-21-21Z" />
        <path d="M34 89c8-10 17-15 26-15s18 5 26 15M48 43c7 5 17 5 24 0" />
      </svg>
    ),
  },
  {
    title: "Materials",
    index: "Archive 02",
    description: "Ascension items, local specialties, and their sources.",
    record: "Resource index",
    href: "/materials",
    icon: (
      <svg viewBox="0 0 120 120" className={iconClassName} aria-hidden="true">
        <path d="M33 53 54 31l33 13 7 37-27 23-36-13-5-26 7-12Z" />
        <path d="m54 31 13 30 27 20M26 65l41-4 20-17M67 61v43" />
        <circle cx="54" cy="31" r="5" />
      </svg>
    ),
  },
  {
    title: "Weapons",
    index: "Archive 03",
    description: "Armaments and refinement records awaiting restoration.",
    record: "Sealed collection",
    icon: (
      <svg viewBox="0 0 120 120" className={iconClassName} aria-hidden="true">
        <path d="m79 18 17 6-9 38-42 42-13-13 42-42 5-31Z" />
        <path d="m54 71 15 15M29 88l-9 9 8 8 9-9M75 49l12 13" />
      </svg>
    ),
  },
  {
    title: "Artifacts",
    index: "Archive 04",
    description: "Relics and set effects awaiting restoration.",
    record: "Sealed collection",
    icon: (
      <svg viewBox="0 0 120 120" className={iconClassName} aria-hidden="true">
        <path d="M60 14 73 42l31 4-23 21 6 31-27-15-27 15 6-31-23-21 31-4 13-28Z" />
        <circle cx="60" cy="61" r="14" />
      </svg>
    ),
  },
  {
    title: "Guides",
    index: "Archive 05",
    description: "Curated field notes awaiting restoration.",
    record: "Sealed collection",
    icon: (
      <svg viewBox="0 0 120 120" className={iconClassName} aria-hidden="true">
        <path d="M18 29c17-7 31-3 42 7 11-10 25-14 42-7v65c-17-7-31-3-42 7-11-10-25-14-42-7V29Z" />
        <path d="M60 36v65M30 49c8-2 15 0 21 4M69 53c6-4 13-6 21-4" />
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
    const timer = window.setTimeout(() => {
      void fetch(`/api/archive${current.href}`, { cache: "force-cache" })
        .then((response) => response.arrayBuffer())
        .catch(() => undefined);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [current.href]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "Enter" && current.href) router.push(current.href);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current.href, router]);

  return (
    <main className="archive-landing">
      <header className="archive-header">
        <div className="archive-brand">
          <span className="archive-brand-mark" aria-hidden="true">
            ✦
          </span>
          <div>
            <h1>Gnovia</h1>
            <p>Celestial archive</p>
          </div>
        </div>
        <ThemeSwitcher />
      </header>

      <section className="archive-picker" aria-label="Archive collections">
        <div className="archive-title-block">
          <p className="archive-kicker">
            <span /> Private collection <span />
          </p>
          <h2>Choose an archive</h2>
          <p></p>
        </div>

        <div className="archive-carousel-stage">
          <button
            className="archive-arrow archive-arrow-left"
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous collection"
          >
            ←
          </button>
          {SECTIONS.map((section, index) => {
            const distance = wrappedDistance(index, selected);
            const active = distance === 0;
            return (
              <button
                key={section.title}
                type="button"
                className={`archive-card ${active ? "is-selected" : ""} ${Math.abs(distance) === 2 ? "is-far" : ""} ${section.href ? "" : "is-locked"}`}
                style={{ "--archive-position": distance } as CSSProperties}
                data-position={distance}
                onClick={() => (active ? enterSection() : setSelected(index))}
                aria-current={active ? "true" : undefined}
                aria-label={`${section.title}${section.href ? "" : ", coming soon"}`}
              >
                <span className="archive-card-frame" />
                <span className="archive-card-corners" aria-hidden="true" />
                <span className="archive-card-engraving" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="archive-card-icon">{section.icon}</span>
                <span className="archive-card-index">{section.index}</span>
                <strong>{section.title}</strong>
                <em>
                  {section.href ? "Open for research" : "Not yet restored"}
                </em>
                <span className="archive-card-rule">
                  <i />
                </span>
                <span className="archive-card-record">{section.record}</span>
                <span className="archive-card-action">
                  {section.href ? "Open archive  →" : "Collection sealed"}
                </span>
              </button>
            );
          })}
          <button
            className="archive-arrow archive-arrow-right"
            type="button"
            onClick={() => move(1)}
            aria-label="Next collection"
          >
            →
          </button>
        </div>

        <div className="archive-carousel-footer" aria-live="polite">
          <div className="archive-dots" aria-hidden="true">
            {SECTIONS.map((section, index) => (
              <span
                key={section.title}
                className={selected === index ? "is-active" : ""}
              />
            ))}
          </div>
          <p>{current.description}</p>
          <button type="button" onClick={enterSection} disabled={!current.href}>
            {current.href ? `Enter ${current.title}` : "Archive unavailable"}
            <span>→</span>
          </button>
        </div>
      </section>
    </main>
  );
}
