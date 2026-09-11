import Image from "next/image";
import type { MaterialInfo } from "@/lib/materialInfo";
import { materialIconUrl } from "@/lib/materialInfo";

interface passedData {
  material: MaterialInfo | null;
  selectedName?: string;
  loading?: boolean;
  error?: boolean;
}

const MaterialDetail: React.FC<passedData> = ({
  material,
  selectedName,
  loading,
  error,
}) => {
  if (!material) {
    return (
      <main
        className="archive-detail max-w-screen overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        id="materialDetail"
      >
        {loading ? (
          <div className="archive-detail-status" role="status">
            <span className="archive-detail-spinner" aria-hidden="true" />
            Loading {selectedName}’s records…
          </div>
        ) : error && selectedName ? (
          <div
            className="archive-detail-status archive-detail-error"
            role="alert"
          >
            Couldn’t load {selectedName}’s records. Refresh to try again.
          </div>
        ) : (
          <h2 className="p-8 text-xs tracking-widest text-white/50 uppercase">
            Choose a material.
          </h2>
        )}
      </main>
    );
  }

  const placeholder = "Placeholder - Craftable Amount: {0}";
  const sources = material.sources.filter((source) => source !== placeholder);

  return (
    <main
      className="archive-detail max-w-screen overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      id="materialDetail"
    >
      <div className="archive-panel mx-8 my-8">
        <div className="archive-panel-header flex items-center gap-4 p-6">
          <Image
            src={materialIconUrl(material.images.filename_icon)}
            alt={material.name}
            width={64}
            height={64}
            className="h-16 w-16 flex-shrink-0"
            unoptimized
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
          <div>
            <h1 className="text-glow text-2xl font-black tracking-wide uppercase">
              {material.name}
            </h1>
            {material.rarity && (
              <p className="text-glow text-sm">{"★".repeat(material.rarity)}</p>
            )}
            <p className="text-xs tracking-widest text-white/50 uppercase">
              {material.typeText ?? material.category}
            </p>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm whitespace-pre-line text-white/80">
            {material.description}
          </p>

          {material.dropDomainName && (
            <div className="mt-6">
              <p className="text-xs tracking-widest text-white/50 uppercase">
                Domain
              </p>
              <p className="mt-1 text-sm">{material.dropDomainName}</p>
              {material.daysOfWeek && material.daysOfWeek.length > 0 && (
                <p className="text-glow mt-1 text-xs">
                  Available: {material.daysOfWeek.join(", ")}
                </p>
              )}
            </div>
          )}

          {sources.length > 0 && (
            <div className="mt-6">
              <p className="text-xs tracking-widest text-white/50 uppercase">
                Sources
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-white/70">
                {sources.map((source, i) => (
                  <li key={i}>{source}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MaterialDetail;
