"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "./themeSwitcher";

const LINKS = [
  { href: "/characters", label: "Characters" },
  { href: "/materials", label: "Materials" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="archive-nav relative z-10 flex items-center justify-between px-8 py-4">
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
    </nav>
  );
}
