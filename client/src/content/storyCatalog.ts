import type { Genre } from "@/game/types";
import marsReadingRoom from "./stories/mars-reading-room.md?raw";
import footprintsInTheMargin from "./stories/footprints-in-the-margin.md?raw";
import pageByTheWindow from "./stories/page-by-the-window.md?raw";
import formOfHesitation from "./stories/form-of-hesitation.md?raw";
import shelfOrganizing from "./stories/shelf-organizing.md?raw";
import steamAndIndex from "./stories/steam-and-index.md?raw";

/** Content context — keep prose in Markdown; this catalog only parses frontmatter. */
export type Story = {
  id: string;
  title: string;
  genre: Genre;
  byline: string;
  effect: string;
  hook: string;
  readingMinutes: number;
  body: string[];
};

function parseStory(raw: string): Story {
  const [, frontmatter = "", prose = ""] = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/) ?? [];
  const fields = Object.fromEntries(
    frontmatter
      .split("\n")
      .map((line) => line.split(/:\s+/, 2))
      .filter(([key, value]) => Boolean(key && value)),
  );

  const body = prose.trim().split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const characterCount = body.join("").replace(/\s/g, "").length;

  return {
    id: fields.id,
    title: fields.title,
    genre: fields.genre as Genre,
    byline: fields.byline,
    effect: fields.effect,
    hook: fields.hook ?? "棚の奥で、まだ名前のない頁がこちらを待っている。",
    readingMinutes: Math.max(1, Math.ceil(characterCount / 400)),
    body,
  };
}

export const storyCatalog = [
  marsReadingRoom,
  footprintsInTheMargin,
  pageByTheWindow,
  formOfHesitation,
  shelfOrganizing,
  steamAndIndex,
].map(parseStory);

export function getStory(storyId: string | null | undefined) {
  return storyCatalog.find((story) => story.id === storyId) ?? null;
}
