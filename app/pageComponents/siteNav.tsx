"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeSwitcher from "./themeSwitcher";

const LINKS = [
  { href: "/characters", label: "Characters" },
  { href: "/materials", label: "Materials" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <nav
      className={`archive-nav relative z-30 ${isCollapsed ? "is-collapsed" : ""}`}
    >
      <div className="archive-nav-inner">
        <Link href="/" className="archive-nav-brand">
          <span aria-hidden="true">✦</span>
          <span>
            <small>Gnovia</small>
            Archive
          </span>
        </Link>
        <div className="archive-nav-actions">
          <div className="archive-nav-links flex gap-2">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={pathname?.startsWith(href) ? "is-active" : ""}
              >
                {label}
              </Link>
            ))}
          </div>
          <ThemeSwitcher />
        </div>
      </div>
      <button
        type="button"
        className="archive-nav-collapse"
        aria-expanded={!isCollapsed}
        aria-label={
          isCollapsed ? "Expand archive menu" : "Collapse archive menu"
        }
        title={isCollapsed ? "Expand menu" : "Collapse menu"}
        onClick={() => setIsCollapsed((collapsed) => !collapsed)}
      >
        <span aria-hidden="true">{isCollapsed ? "⌄" : "⌃"}</span>
        <span>{isCollapsed ? "Menu" : "Hide"}</span>
      </button>
    </nav>
  );
}
