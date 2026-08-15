export type Genre =
  | "sf"
  | "mystery"
  | "literature"
  | "philosophy"
  | "practical"
  | "cooking";

export type AidKind = "glasses" | "contacts" | "ereader" | "lamp";

export type GameMode =
  | "title"
  | "exploring"
  | "bookChoice"
  | "memoryChoice"
  | "chapterClear"
  | "ending";

export type Ending = "clear" | "exhausted" | null;

export type Point = { x: number; z: number };

export type Book = {
  id: string;
  genre: Genre;
  title: string;
  byline: string;
  effect: string;
  position: Point;
};

export type Aid = {
  id: string;
  kind: AidKind;
  name: string;
  note: string;
  position: Point;
};

export type Ability = {
  genre: Genre;
  name: string;
  short: string;
  description: string;
};

export type GameAction =
  | { type: "start" }
  | { type: "restart" }
  | { type: "move"; dx: number; dz: number }
  | { type: "read" }
  | { type: "carry" }
  | { type: "leave" }
  | { type: "replaceMemory"; genre: Genre | null }
  | { type: "rest" }
  | { type: "readCarried"; id: string }
  | { type: "advance" }
  | { type: "special"; ability: Genre };

export type GameSnapshot = {
  mode: GameMode;
  ending: Ending;
  chapter: number;
  age: number;
  clarity: number;
  clarityLabel: string;
  vigor: number;
  maxVigor: number;
  turns: number;
  tsundoku: Book[];
  memory: Ability[];
  aids: Aid[];
  activeBook: Book | null;
  activeBookCarried: boolean;
  pendingAbility: Ability | null;
  canRest: boolean;
  specialReady: Genre[];
  log: string[];
  score: number;
  routeHint: string | null;
  finalNote: string | null;
};
