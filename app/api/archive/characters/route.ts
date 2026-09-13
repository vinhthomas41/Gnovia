import { getArchiveCharacters, getArchiveItemNames } from "@/lib/characterData";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(
    {
      characters: getArchiveCharacters(),
      itemNames: getArchiveItemNames(),
    },
    {
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
