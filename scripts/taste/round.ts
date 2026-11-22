import { createHash } from "node:crypto";
import { z } from "zod";
import type { DuelCard } from "./cards.ts";

export type CodeLine = [line: number, text: string];
export type Duel = Omit<DuelCard, "anchor"> & { code?: { on: number; lines: CodeLine[] } };

const ideaSchema = z.strictObject({
  /** One plain sentence: the change to the skill. */
  idea: z.string().min(1),
  /** A real text a review wrote. */
  before: z.string().min(1),
  /** The same text as the idea would make it. */
  after: z.string().min(1),
});
export const ideasSchema = z.array(ideaSchema);
export type Idea = z.infer<typeof ideaSchema>;

const roundSchema = z.object({
  id: z.string(),
  duels: z.array(z.custom<Duel>((value) => typeof value === "object" && value !== null)),
  ideas: ideasSchema,
});
export type Round = z.infer<typeof roundSchema>;

/** round.json is written by this module, so only its outer shape is checked. */
export function parseRound(text: string): Round {
  return roundSchema.parse(JSON.parse(text));
}

export function makeRound(duels: Duel[], ideas: Idea[]): Round {
  // Every text is in the id, so a code never reads against a round with other words.
  const id = createHash("sha1").update(JSON.stringify({ duels, ideas })).digest("hex").slice(0, 8);
  return { id, duels, ideas };
}

/** Keeps `max` cards, chosen in hash order so no case or kind is favored, in their first order. */
export function limitDuels(duels: Duel[], max: number): Duel[] {
  const hash = (duel: Duel) => duel.id.slice(duel.id.lastIndexOf(".") + 1);
  const kept = new Set(duels.toSorted((a, b) => hash(a).localeCompare(hash(b))).slice(0, max));
  return duels.filter((duel) => kept.has(duel));
}

const DUEL_ANSWERS = { x: "x", y: "y", s: "same", n: "both-bad", "-": "open" } as const;
const IDEA_ANSWERS = { y: "try", n: "skip", "-": "open" } as const;

export type DuelAnswer = (typeof DUEL_ANSWERS)[keyof typeof DUEL_ANSWERS];
export type IdeaAnswer = (typeof IDEA_ANSWERS)[keyof typeof IDEA_ANSWERS];

export type Picks = {
  duels: { duel: Duel; answer: DuelAnswer }[];
  ideas: { idea: Idea; answer: IdeaAnswer }[];
};

function isKey<T extends object>(map: T, key: string): key is Extract<keyof T, string> {
  return Object.hasOwn(map, key);
}

/**
 * The page prints `taste.<round id>.<one letter per duel>.<one letter per idea>`.
 * The round id ties the letters to this round's cards.
 */
export function readCode(round: Round, code: string): Picks {
  const [word, id, duels, ideas, ...rest] = code.trim().split(".");
  if (word !== "taste" || id === undefined || duels === undefined || ideas === undefined) {
    throw new Error(`not a taste code: ${code}`);
  }
  if (rest.length > 0 || id !== round.id) {
    throw new Error(`the code is for round ${id}, and this folder holds round ${round.id}`);
  }
  if (duels.length !== round.duels.length || ideas.length !== round.ideas.length) {
    throw new Error(
      `the code holds ${duels.length} duels and ${ideas.length} ideas, and the round has ${round.duels.length} and ${round.ideas.length}`,
    );
  }
  const letter = <T extends object>(map: T, value: string): T[Extract<keyof T, string>] => {
    if (!isKey(map, value)) {
      throw new Error(`unknown answer letter "${value}" in ${code}`);
    }
    return map[value];
  };
  return {
    duels: round.duels.map((duel, index) => ({
      duel,
      answer: letter(DUEL_ANSWERS, duels.charAt(index)),
    })),
    ideas: round.ideas.map((idea, index) => ({
      idea,
      answer: letter(IDEA_ANSWERS, ideas.charAt(index)),
    })),
  };
}

export type Tally = { label: string; wins: number; losses: number };

/** Wins and losses per side label. "Same", "both bad" and open cards count for no side. */
export function tally(picks: Picks): Tally[] {
  const rows = new Map<string, Tally>();
  const row = (label: string) => {
    const found = rows.get(label) ?? { label, wins: 0, losses: 0 };
    rows.set(label, found);
    return found;
  };
  for (const { duel, answer } of picks.duels) {
    const [x, y] = [row(duel.x.label), row(duel.y.label)];
    if (answer === "x" || answer === "y") {
      (answer === "x" ? x : y).wins += 1;
      (answer === "x" ? y : x).losses += 1;
    }
  }
  return [...rows.values()].toSorted((a, b) => b.wins - b.losses - (a.wins - a.losses));
}
