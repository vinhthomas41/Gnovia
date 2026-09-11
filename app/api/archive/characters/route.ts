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
          "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400",
      },
    },
  );
}
