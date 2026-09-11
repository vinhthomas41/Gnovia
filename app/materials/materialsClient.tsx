"use client";

import { useEffect, useState } from "react";
import MaterialSidebar from "../pageComponents/materialSidebar";
import MaterialDetail from "../pageComponents/materialDetail";
import SiteNav from "../pageComponents/siteNav";
import type { MaterialInfo, MaterialSummary } from "@/lib/materialInfo";

export default function MaterialsClient({
  materials,
}: {
  materials: MaterialSummary[];
}) {
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(
    null,
  );
  const [details, setDetails] = useState<MaterialInfo[] | null>(null);
  const [detailError, setDetailError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/archive/materials", {
      cache: "force-cache",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Material details failed to load.");
        return response.json() as Promise<MaterialInfo[]>;
      })
      .then(setDetails)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setDetailError(true);
      });
    return () => controller.abort();
  }, []);

  const currentMaterial =
    details?.find((material) => material.id === selectedMaterialId) ?? null;
  const selectedSummary = materials.find(
    (material) => material.id === selectedMaterialId,
  );

  return (
    <div className="archive-database-shell archive-brutalist-type text-textColor1 relative flex h-screen flex-col overflow-hidden">
      <SiteNav />
      <div className="archive-database-body relative z-10 flex min-h-0 flex-1">
        <MaterialSidebar
          materials={materials}
          selected={selectedSummary ?? null}
          onSelect={(material) => setSelectedMaterialId(material.id)}
        />
        <MaterialDetail
          material={currentMaterial}
          selectedName={selectedSummary?.name}
          loading={selectedMaterialId !== null && !details && !detailError}
          error={detailError}
        />
      </div>
    </div>
  );
}
