"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import {
  groupMaterialsByType,
  materialIconUrl,
  type MaterialSummary,
} from "@/lib/materialInfo";

interface passedData {
  materials: MaterialSummary[];
  selected: MaterialSummary | null;
  onSelect: (material: MaterialSummary) => void;
}

const MaterialSidebar: React.FC<passedData> = ({
  materials,
  selected,
  onSelect,
}) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return materials;
    return materials.filter((material) =>
      material.name.toLowerCase().includes(query),
    );
  }, [materials, search]);

  const groups = useMemo(() => groupMaterialsByType(filtered), [filtered]);

  return (
    <aside
      className="archive-sidebar [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-glow h-full w-72 flex-shrink-0 overflow-y-auto [&::-webkit-scrollbar]:w-1"
      id="materialSidebar"
    >
      <div className="archive-sidebar-tools sticky top-0 z-10 p-3">
        <input
          className="archive-search w-full px-3 py-2 text-sm outline-none"
          type="text"
          placeholder="Search materials…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="mt-1 text-xs text-white/40">
          {filtered.length} / {materials.length} materials
        </p>
      </div>
      {groups.map((group) => (
        <div key={group.label}>
          <div className="archive-group-label text-glow px-3 py-2 text-xs tracking-widest uppercase">
            {group.label}{" "}
            <span className="text-white/40">({group.materials.length})</span>
          </div>
          <ul className="archive-sidebar-list">
            {group.materials.map((material) => (
              <li
                key={material.id}
                className={`archive-sidebar-item flex cursor-pointer items-center gap-2 p-2 px-3 text-sm tracking-wide transition-colors ${
                  selected?.id === material.id ? "is-selected" : ""
                }`}
                onClick={() => onSelect(material)}
              >
                <Image
                  src={materialIconUrl(material.images.filename_icon)}
                  alt={material.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 flex-shrink-0"
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
                <span className="truncate">{material.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
};

export default MaterialSidebar;
