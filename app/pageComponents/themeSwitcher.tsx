"use client";

const THEMES = [
  { id: "blue", label: "Asterium blue" },
  { id: "teal", label: "Lunary teal" },
  { id: "plum", label: "Solenne plum" },
] as const;

type ArchiveTheme = (typeof THEMES)[number]["id"];

export default function ThemeSwitcher() {
  function chooseTheme(nextTheme: ArchiveTheme) {
    document.documentElement.setAttribute("data-archive-theme", nextTheme);
    window.localStorage.setItem("gnovia-archive-theme", nextTheme);
  }

  return (
    <div
      className="archive-theme-switcher"
      role="group"
      aria-label="Color theme"
    >
      <span className="archive-theme-label">Theme</span>
      {THEMES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`archive-theme-swatch archive-theme-${id}`}
          onClick={() => chooseTheme(id)}
          aria-label={`Use ${label} theme`}
          title={label}
        >
          <span />
        </button>
      ))}
    </div>
  );
}
