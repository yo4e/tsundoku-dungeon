import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { assets } from "./assets";
import type {
  Ability,
  Aid,
  AidKind,
  Book,
  GameAction,
  GameMode,
  GameSnapshot,
  Genre,
  Point,
} from "./types";

const GRID_W = 9;
const GRID_H = 7;
const START: Point = { x: 0, z: 3 };
const EXIT: Point = { x: 8, z: 3 };

const GENRES: Record<Genre, Omit<Ability, "genre"> & { color: string }> = {
  sf: {
    name: "予見",
    short: "次の章を覗く",
    description: "次の章に現れる本と補助具を欄外へ書き留め、出口への筋を淡く照らす。",
    color: "#33c7d6",
  },
  mystery: {
    name: "推理",
    short: "筋道を引く",
    description: "各章に一度、最寄りの本か出口までの手掛かりを引く。",
    color: "#9373df",
  },
  literature: {
    name: "余韻",
    short: "休むほど澄む",
    description: "休息台で余白をより多く取り戻し、文字の輪郭も少し戻す。",
    color: "#e9dcc2",
  },
  philosophy: {
    name: "逡巡",
    short: "一歩を戻す",
    description: "各章に一度、直前の一歩へ静かに戻れる。",
    color: "#74808c",
  },
  practical: {
    name: "段取り",
    short: "重みを整える",
    description: "積読による余白の減りを、一冊ぶんだけ和らげる。",
    color: "#93a35c",
  },
  cooking: {
    name: "滋養",
    short: "余白を温める",
    description: "読了時に余白を回復し、以後の休息にも温かさを足す。",
    color: "#df825a",
  },
};

const BOOKS: Omit<Book, "id" | "position">[] = [
  {
    genre: "sf",
    title: "火星の読書室",
    byline: "未来観測局",
    effect: "出口への見通しを残す",
  },
  {
    genre: "mystery",
    title: "余白の足跡",
    byline: "無署名の探偵",
    effect: "一度だけ筋道を引く",
  },
  {
    genre: "literature",
    title: "窓辺の頁",
    byline: "季節の作家",
    effect: "休息に余韻を足す",
  },
  {
    genre: "philosophy",
    title: "迷いの形式",
    byline: "夜の講義録",
    effect: "直前の一歩を戻せる",
  },
  {
    genre: "practical",
    title: "棚の整理術",
    byline: "生活の編集者",
    effect: "積読の重みを整える",
  },
  {
    genre: "cooking",
    title: "湯気と索引",
    byline: "台所の人",
    effect: "余白を温める",
  },
];

const AID_DATA: Record<AidKind, Omit<Aid, "id" | "position">> = {
  glasses: { kind: "glasses", name: "老眼鏡", note: "文字の輪郭を +30" },
  contacts: {
    kind: "contacts",
    name: "遠近両用コンタクト",
    note: "文字の輪郭を +22、棚の端まで見渡す",
  },
  ereader: {
    kind: "ereader",
    name: "電子書籍端末",
    note: "文字の輪郭を保ち、積読を一冊ぶん軽くする",
  },
  lamp: { kind: "lamp", name: "読書灯", note: "文字の輪郭を +18、休息を +1" },
};

const WALLS: Point[][] = [
  [
    { x: 2, z: 0 },
    { x: 2, z: 1 },
    { x: 2, z: 2 },
    { x: 2, z: 4 },
    { x: 4, z: 2 },
    { x: 4, z: 3 },
    { x: 6, z: 1 },
    { x: 6, z: 2 },
    { x: 6, z: 4 },
    { x: 7, z: 4 },
  ],
  [
    { x: 1, z: 1 },
    { x: 1, z: 2 },
    { x: 3, z: 0 },
    { x: 3, z: 1 },
    { x: 3, z: 4 },
    { x: 3, z: 5 },
    { x: 5, z: 2 },
    { x: 5, z: 3 },
    { x: 7, z: 1 },
    { x: 7, z: 2 },
  ],
  [
    { x: 2, z: 1 },
    { x: 2, z: 2 },
    { x: 2, z: 4 },
    { x: 3, z: 4 },
    { x: 4, z: 1 },
    { x: 4, z: 2 },
    { x: 5, z: 4 },
    { x: 6, z: 4 },
    { x: 7, z: 2 },
    { x: 7, z: 5 },
  ],
  [
    { x: 1, z: 4 },
    { x: 2, z: 1 },
    { x: 2, z: 2 },
    { x: 3, z: 1 },
    { x: 3, z: 4 },
    { x: 4, z: 4 },
    { x: 5, z: 2 },
    { x: 5, z: 3 },
    { x: 6, z: 5 },
    { x: 7, z: 1 },
  ],
];

const BOOK_POSITIONS: Point[] = [
  { x: 1, z: 0 },
  { x: 1, z: 5 },
  { x: 4, z: 0 },
  { x: 4, z: 6 },
  { x: 6, z: 6 },
  { x: 7, z: 0 },
];

const AID_POSITIONS: Point[] = [
  { x: 0, z: 0 },
  { x: 4, z: 5 },
  { x: 6, z: 0 },
  { x: 7, z: 6 },
];

function key({ x, z }: Point) {
  return `${x}:${z}`;
}

function pointEq(a: Point, b: Point) {
  return a.x === b.x && a.z === b.z;
}

function toWorld({ x, z }: Point) {
  return new Vector3(x - 4, 0, z - 3);
}

function material(scene: Scene, name: string, hex: string, emissive = 0) {
  const m = new StandardMaterial(name, scene);
  const color = Color3.FromHexString(hex);
  m.diffuseColor = color;
  m.specularColor = Color3.Black();
  m.emissiveColor = color.scale(emissive);
  return m;
}

export class GameWorld {
  private mode: GameMode = "title";
  private chapter = 1;
  private age = 38;
  private turns = 0;
  private vigor = 22;
  private position: Point = { ...START };
  private previousPositions: Point[] = [];
  private walls = new Set<string>();
  private books: Book[] = [];
  private aids: Aid[] = [];
  private tsundoku: Book[] = [];
  private memory: Genre[] = [];
  private acquiredAids: Aid[] = [];
  private activeBook: Book | null = null;
  private activeBookCarried = false;
  private pendingBook: Book | null = null;
  private bookMeshes = new Map<string, Mesh[]>();
  private aidMeshes = new Map<string, Mesh[]>();
  private boardMeshes: Mesh[] = [];
  private playerMesh: Mesh | null = null;
  private exitMeshes: Mesh[] = [];
  private floorTexture: Texture | null = null;
  private routeHint: string | null = null;
  private finalNote: string | null = null;
  private ending: GameSnapshot["ending"] = null;
  private log: string[] = ["棚の隙間に、まだ読んでいない夜がある。"];
  private chapterSpecialUsed = new Set<Genre>();
  private onSnapshot: (snapshot: GameSnapshot) => void;

  constructor(private scene: Scene, emit: (snapshot: GameSnapshot) => void) {
    this.onSnapshot = emit;
  }

  initialize() {
    this.createPlayer();
    this.buildChapter();
    this.emit();
  }

  update(delta: number) {
    if (this.playerMesh) {
      const target = toWorld(this.position);
      this.playerMesh.position.x += (target.x - this.playerMesh.position.x) * Math.min(1, delta * 12);
      this.playerMesh.position.z += (target.z - this.playerMesh.position.z) * Math.min(1, delta * 12);
      this.playerMesh.rotation.y += delta * 0.6;
    }
    Array.from(this.bookMeshes.entries()).forEach(([id, meshes]) => {
      const book = this.books.find((candidate) => candidate.id === id);
      if (!book) return;
      const wave = Math.sin(performance.now() / 620 + book.position.x * 2 + book.position.z);
      meshes.forEach((mesh: Mesh, index: number) => {
        mesh.position.y = 0.18 + Math.max(0, wave) * 0.035 + index * 0.035;
      });
    });
  }

  act(action: GameAction) {
    if (action.type === "start") {
      this.mode = "exploring";
      this.pushLog("第1章：棚の底で、まだ若い頁を開く。\n");
      this.emit();
      return;
    }
    if (action.type === "restart") {
      this.reset();
      return;
    }
    if (this.mode === "ending" || this.mode === "title") return;

    if (action.type === "advance" && this.mode === "chapterClear") {
      this.chapter += 1;
      this.age += 2;
      this.vigor = this.maxVigor();
      this.position = { ...START };
      this.previousPositions = [];
      this.mode = "exploring";
      this.chapterSpecialUsed.clear();
      this.routeHint = null;
      this.buildChapter();
      this.pushLog(`第${this.chapter}章：棚は静かに組み替わった。`);
      this.emit();
      return;
    }
    if (action.type === "move" && this.mode === "exploring") {
      this.move(action.dx, action.dz);
      return;
    }
    if (action.type === "read" && this.mode === "bookChoice") {
      this.readBook();
      return;
    }
    if (action.type === "carry" && this.mode === "bookChoice") {
      this.carryBook();
      return;
    }
    if (action.type === "leave" && this.mode === "bookChoice") {
      const wasCarried = this.activeBookCarried;
      this.activeBook = null;
      this.activeBookCarried = false;
      this.mode = "exploring";
      this.pushLog(wasCarried ? "積読の腕のなかへ、本をそっと戻した。\n" : "背表紙を撫でて、その本は棚に残した。\n");
      this.emit();
      return;
    }
    if (action.type === "replaceMemory" && this.mode === "memoryChoice") {
      this.commitMemory(action.genre);
      return;
    }
    if (action.type === "rest" && this.mode === "exploring" && this.isAtRest()) {
      this.rest();
      return;
    }
    if (action.type === "readCarried" && this.mode === "exploring" && this.isAtRest()) {
      this.readCarried(action.id);
      return;
    }
    if (action.type === "special" && this.mode === "exploring") {
      this.useSpecial(action.ability);
    }
  }

  dispose() {
    this.clearBoard();
    this.playerMesh?.dispose();
    this.floorTexture?.dispose();
  }

  private reset() {
    this.mode = "exploring";
    this.chapter = 1;
    this.age = 38;
    this.turns = 0;
    this.vigor = 22;
    this.position = { ...START };
    this.previousPositions = [];
    this.tsundoku = [];
    this.memory = [];
    this.acquiredAids = [];
    this.activeBook = null;
    this.activeBookCarried = false;
    this.pendingBook = null;
    this.routeHint = null;
    this.finalNote = null;
    this.ending = null;
    this.chapterSpecialUsed.clear();
    this.log = ["新しい夜。新しい棚。読むことを、また選ぶ。"];
    this.buildChapter();
    this.emit();
  }

  private move(dx: number, dz: number) {
    const next = { x: this.position.x + dx, z: this.position.z + dz };
    if (
      next.x < 0 ||
      next.x >= GRID_W ||
      next.z < 0 ||
      next.z >= GRID_H ||
      this.walls.has(key(next))
    ) {
      this.pushLog("そこは背表紙の壁だ。別の余白を探そう。\n");
      this.emit();
      return;
    }
    this.previousPositions.push({ ...this.position });
    if (this.previousPositions.length > 3) this.previousPositions.shift();
    this.position = next;
    this.spendTurn("一歩、棚の奥へ進んだ。");
    if (this.mode === "ending") return;

    const aid = this.aids.find((candidate) => pointEq(candidate.position, this.position));
    if (aid) this.collectAid(aid);

    if (pointEq(this.position, EXIT)) {
      if (this.chapter === 4) {
        this.finish("clear");
      } else {
        this.mode = "chapterClear";
        this.pushLog("金の梯子に指が触れた。次の棚へ降りられる。\n");
        this.emit();
      }
      return;
    }

    const book = this.books.find((candidate) => pointEq(candidate.position, this.position));
    if (book) {
      this.activeBook = book;
      this.activeBookCarried = false;
      this.mode = "bookChoice";
      this.pushLog(`「${book.title}」が、こちらを見ている。\n`);
      this.emit();
      return;
    }
    this.emit();
  }

  private readBook() {
    const book = this.activeBook;
    if (!book) return;
    if (this.activeBookCarried) this.tsundoku = this.tsundoku.filter((candidate) => candidate.id !== book.id);
    else this.removeBook(book);
    this.activeBook = null;
    this.activeBookCarried = false;
    this.spendTurn(`「${book.title}」を読む。年輪が一つ、頁の隅に増えた。`);
    if (this.mode === "ending") return;

    if (this.memory.includes(book.genre)) {
      this.applyReadPulse(book.genre);
      this.mode = "exploring";
      this.emit();
      return;
    }
    if (this.memory.length < 3) {
      this.memory.push(book.genre);
      this.applyReadPulse(book.genre);
      this.mode = "exploring";
      this.pushLog(`記憶に「${GENRES[book.genre].name}」が住みついた。\n`);
      this.emit();
      return;
    }
    this.pendingBook = book;
    this.mode = "memoryChoice";
    this.pushLog("記憶の棚は満ちている。どの一冊を手放す？\n");
    this.emit();
  }

  private carryBook() {
    const book = this.activeBook;
    if (!book) return;
    if (this.tsundoku.length >= 4) {
      this.pushLog("もう四冊。腕の中に、これ以上の余白はない。\n");
      this.emit();
      return;
    }
    this.removeBook(book);
    this.tsundoku.push(book);
    this.activeBook = null;
    this.activeBookCarried = false;
    this.mode = "exploring";
    this.vigor = Math.min(this.vigor, this.maxVigor());
    this.pushLog(`「${book.title}」を抱えた。積読は ${this.tsundoku.length} 冊。\n`);
    this.emit();
  }

  private commitMemory(replaced: Genre | null) {
    const pending = this.pendingBook;
    if (!pending) return;
    if (replaced) this.memory = this.memory.filter((genre) => genre !== replaced);
    this.memory.push(pending.genre);
    this.pendingBook = null;
    this.applyReadPulse(pending.genre);
    this.mode = "exploring";
    this.pushLog(`記憶の棚に「${GENRES[pending.genre].name}」を置いた。\n`);
    this.emit();
  }

  private rest() {
    this.spendTurn("返却台の灯りの下で、少しだけ休む。\n");
    if (this.mode === "ending") return;
    const bonus = this.memory.includes("literature") ? 2 : 0;
    const lampBonus = this.hasAid("lamp") ? 1 : 0;
    this.vigor = Math.min(this.maxVigor(), this.vigor + 4 + bonus + lampBonus);
    if (this.memory.includes("literature")) this.age = Math.max(38, this.age - 1);
    this.pushLog("余白が戻った。けれど時計は止まらない。\n");
    this.emit();
  }

  private readCarried(id: string) {
    const book = this.tsundoku.find((candidate) => candidate.id === id);
    if (!book) return;
    this.activeBook = book;
    this.activeBookCarried = true;
    this.mode = "bookChoice";
    this.pushLog(`積読から「${book.title}」を取り出した。今なら読める。\n`);
    this.emit();
  }

  private useSpecial(ability: Genre) {
    if (!this.memory.includes(ability)) return;
    if (ability === "philosophy") {
      if (this.chapterSpecialUsed.has(ability) || this.previousPositions.length === 0) return;
      this.chapterSpecialUsed.add(ability);
      const previous = this.previousPositions.pop();
      if (previous) this.position = previous;
      this.pushLog("逡巡した。一歩だけ、別の頁へ戻る。\n");
      this.emit();
      return;
    }
    if (ability === "mystery") {
      if (this.chapterSpecialUsed.has(ability)) return;
      this.chapterSpecialUsed.add(ability);
      this.routeHint = "推理の糸：出口へは中央の通路を、右へ。";
      this.pushLog("余白に細い鉛筆の線が走った。\n");
      this.emit();
      return;
    }
    if (ability === "sf") {
      this.routeHint = `予見：次の棚には「${BOOKS[(this.chapter + 1) % BOOKS.length].title}」と補助具が待つ。`;
      this.pushLog("まだ開いていない棚の一頁が、淡く透けた。\n");
      this.emit();
    }
  }

  private applyReadPulse(genre: Genre) {
    if (genre === "cooking") {
      this.vigor = Math.min(this.maxVigor(), this.vigor + 4);
      this.pushLog("湯気のように、余白が温まった。\n");
    }
    if (genre === "sf") {
      this.routeHint = `予見：次の棚には「${BOOKS[(this.chapter + 1) % BOOKS.length].title}」がある。`;
    }
    if (genre === "practical") {
      this.vigor = Math.min(this.maxVigor(), this.vigor + 1);
    }
  }

  private spendTurn(note: string) {
    this.turns += 1;
    this.vigor -= 1;
    if (this.turns % 5 === 0) {
      this.age += 1;
      this.pushLog("年輪が一つ増え、活字が少し遠ざかる。\n");
    }
    this.pushLog(note);
    if (this.vigor <= 0) this.finish("exhausted");
  }

  private finish(ending: NonNullable<GameSnapshot["ending"]>) {
    this.ending = ending;
    this.mode = "ending";
    this.finalNote =
      ending === "clear"
        ? "最奥の梯子まで来た。読まなかった本も、あなたの棚に残る。"
        : "抱えた本と、過ぎた時間が、今夜はあなたを棚の入口へ戻した。";
    this.pushLog("人は老いる。だが読む。\n");
    this.emit();
  }

  private collectAid(aid: Aid) {
    this.acquiredAids.push(aid);
    this.aids = this.aids.filter((candidate) => candidate.id !== aid.id);
    this.aidMeshes.get(aid.id)?.forEach((mesh) => mesh.dispose());
    this.aidMeshes.delete(aid.id);
    this.pushLog(`「${aid.name}」を見つけた。${aid.note}。\n`);
  }

  private hasAid(kind: AidKind) {
    return this.acquiredAids.some((aid) => aid.kind === kind);
  }

  private isAtRest() {
    return pointEq(this.position, { x: 0, z: 6 });
  }

  private clarity() {
    const ageCost = Math.max(0, this.age - 38) * 2;
    const physicalLoad = this.tsundoku.length * 7;
    const aids =
      (this.hasAid("glasses") ? 30 : 0) +
      (this.hasAid("contacts") ? 22 : 0) +
      (this.hasAid("lamp") ? 18 : 0);
    const eReaderFloor = this.hasAid("ereader") ? 72 : 0;
    return Math.min(100, Math.max(eReaderFloor, 100 - ageCost - physicalLoad + aids));
  }

  private clarityLabel() {
    const clarity = this.clarity();
    if (clarity >= 85) return "くっきり読める";
    if (clarity >= 66) return "少し離れている";
    if (clarity >= 45) return "眼を細める";
    return "活字がほどける";
  }

  private maxVigor() {
    const lightenedBooks = (this.memory.includes("practical") ? 1 : 0) + (this.hasAid("ereader") ? 1 : 0);
    const effectiveTsundoku = Math.max(0, this.tsundoku.length - lightenedBooks);
    return Math.max(9, 22 - Math.max(0, effectiveTsundoku - 1) * 3);
  }

  private ability(genre: Genre): Ability {
    const { name, short, description } = GENRES[genre];
    return { genre, name, short, description };
  }

  private specialReady() {
    return this.memory.filter((genre) => {
      if (genre === "mystery" || genre === "philosophy") return !this.chapterSpecialUsed.has(genre);
      return genre === "sf";
    });
  }

  private pushLog(line: string) {
    this.log = [line.trim(), ...this.log].slice(0, 5);
  }

  private emit() {
    this.onSnapshot({
      mode: this.mode,
      ending: this.ending,
      chapter: this.chapter,
      age: this.age,
      clarity: this.clarity(),
      clarityLabel: this.clarityLabel(),
      vigor: Math.max(0, this.vigor),
      maxVigor: this.maxVigor(),
      turns: this.turns,
      tsundoku: this.tsundoku,
      memory: this.memory.map((genre) => this.ability(genre)),
      aids: this.acquiredAids,
      activeBook: this.activeBook,
      activeBookCarried: this.activeBookCarried,
      pendingAbility: this.pendingBook ? this.ability(this.pendingBook.genre) : null,
      canRest: this.isAtRest(),
      specialReady: this.specialReady(),
      log: this.log,
      score: this.chapter * 120 + this.memory.length * 35 + this.acquiredAids.length * 25 - this.tsundoku.length * 18,
      routeHint: this.routeHint,
      finalNote: this.finalNote,
    });
  }

  private buildChapter() {
    this.clearBoard();
    this.walls = new Set(WALLS[(this.chapter - 1) % WALLS.length].map(key));
    this.books = BOOK_POSITIONS.filter((position) => !this.walls.has(key(position))).map((position, index) => {
      const source = BOOKS[(index + this.chapter - 1) % BOOKS.length];
      return { ...source, id: `b-${this.chapter}-${index}`, position: { ...position } };
    });
    const aidKinds: AidKind[] = ["glasses", "lamp", "contacts", "ereader"];
    const aidSource = AID_DATA[aidKinds[(this.chapter - 1) % aidKinds.length]];
    const aidPosition = AID_POSITIONS[(this.chapter - 1) % AID_POSITIONS.length];
    this.aids = [
      {
        ...aidSource,
        id: `aid-${this.chapter}`,
        position: { ...aidPosition },
      },
    ];

    this.createFloor();
    this.createWalls();
    this.createExit();
    this.books.forEach((book) => this.createBook(book));
    this.aids.forEach((aid) => this.createAid(aid));
    this.createRestDesk();
    this.updatePlayerImmediate();
  }

  private clearBoard() {
    this.boardMeshes.forEach((mesh) => mesh.dispose());
    this.exitMeshes.forEach((mesh) => mesh.dispose());
    this.bookMeshes.forEach((meshes) => meshes.forEach((mesh) => mesh.dispose()));
    this.aidMeshes.forEach((meshes) => meshes.forEach((mesh) => mesh.dispose()));
    this.boardMeshes = [];
    this.exitMeshes = [];
    this.bookMeshes.clear();
    this.aidMeshes.clear();
  }

  private createFloor() {
    const ground = MeshBuilder.CreateGround("shelf-floor", { width: 10.1, height: 8.1 }, this.scene);
    const groundMat = new StandardMaterial("shelf-backdrop", this.scene);
    this.floorTexture?.dispose();
    this.floorTexture = new Texture(assets.shelfBackdrop, this.scene, true, false);
    this.floorTexture.uScale = 0.75;
    this.floorTexture.vScale = 0.7;
    groundMat.diffuseTexture = this.floorTexture;
    groundMat.diffuseColor = new Color3(0.18, 0.17, 0.21);
    groundMat.emissiveColor = new Color3(0.025, 0.02, 0.035);
    groundMat.specularColor = Color3.Black();
    ground.material = groundMat;
    this.boardMeshes.push(ground);

    for (let x = 0; x < GRID_W; x += 1) {
      for (let z = 0; z < GRID_H; z += 1) {
        const tile = MeshBuilder.CreateBox(`tile-${x}-${z}`, { width: 0.9, depth: 0.9, height: 0.04 }, this.scene);
        tile.position = toWorld({ x, z });
        tile.position.y = 0.01;
        tile.material = material(this.scene, `tile-mat-${x}-${z}`, (x + z) % 2 ? "#27263b" : "#222134", 0.02);
        this.boardMeshes.push(tile);
      }
    }
  }

  private createWalls() {
    const shelfColors = ["#35263c", "#283b4c", "#4a322e", "#42461f", "#56313c"];
    Array.from(this.walls).forEach((encoded, index) => {
      const parts = encoded.split(":");
      const x = Number(parts[0]);
      const z = Number(parts[1]);
      const base = toWorld({ x, z });
      for (let stack = 0; stack < 3; stack += 1) {
        const spine = MeshBuilder.CreateBox(`shelf-${encoded}-${stack}`, { width: 0.84, depth: 0.72, height: 0.22 }, this.scene);
        spine.position = new Vector3(base.x, 0.18 + stack * 0.22, base.z);
        spine.position.x += (stack % 2 ? 0.035 : -0.025);
        spine.material = material(this.scene, `shelf-mat-${encoded}-${stack}`, shelfColors[(index + stack) % shelfColors.length], 0.03);
        this.boardMeshes.push(spine);
      }
    });
  }

  private createExit() {
    const base = toWorld(EXIT);
    const ladderMat = material(this.scene, "ladder-gold", "#b69a56", 0.22);
    for (let i = 0; i < 3; i += 1) {
      const rung = MeshBuilder.CreateBox(`ladder-${i}`, { width: 0.78, depth: 0.1, height: 0.07 }, this.scene);
      rung.position = new Vector3(base.x, 0.12 + i * 0.16, base.z);
      rung.material = ladderMat;
      this.exitMeshes.push(rung);
    }
    const railA = MeshBuilder.CreateBox("ladder-rail-a", { width: 0.08, depth: 0.1, height: 0.55 }, this.scene);
    railA.position = new Vector3(base.x - 0.33, 0.32, base.z);
    railA.material = ladderMat;
    const railB = railA.clone("ladder-rail-b");
    railB.position.x = base.x + 0.33;
    this.exitMeshes.push(railA, railB);
  }

  private createBook(book: Book) {
    const root = toWorld(book.position);
    const color = GENRES[book.genre].color;
    const meshes: Mesh[] = [];
    for (let i = 0; i < 3; i += 1) {
      const volume = MeshBuilder.CreateBox(`book-${book.id}-${i}`, { width: 0.32, depth: 0.48, height: 0.13 }, this.scene);
      volume.position = new Vector3(root.x + (i - 1) * 0.025, 0.22 + i * 0.035, root.z + (i - 1) * 0.01);
      volume.rotation.y = (i - 1) * 0.08;
      volume.material = material(this.scene, `book-mat-${book.id}-${i}`, i === 2 ? color : "#221f2e", 0.1);
      meshes.push(volume);
    }
    this.bookMeshes.set(book.id, meshes);
  }

  private createAid(aid: Aid) {
    const root = toWorld(aid.position);
    const brass = material(this.scene, `aid-mat-${aid.id}`, "#d7b66e", 0.15);
    const meshes: Mesh[] = [];
    if (aid.kind === "lamp") {
      const stem = MeshBuilder.CreateCylinder(`lamp-stem-${aid.id}`, { height: 0.32, diameter: 0.08 }, this.scene);
      stem.position = new Vector3(root.x, 0.22, root.z);
      stem.material = brass;
      const shade = MeshBuilder.CreateCylinder(`lamp-shade-${aid.id}`, { height: 0.14, diameterTop: 0.3, diameterBottom: 0.17 }, this.scene);
      shade.position = new Vector3(root.x, 0.43, root.z);
      shade.material = brass;
      meshes.push(stem, shade);
    } else {
      const token = MeshBuilder.CreateCylinder(`aid-${aid.id}`, { height: 0.12, diameter: 0.44, tessellation: 24 }, this.scene);
      token.position = new Vector3(root.x, 0.17, root.z);
      token.material = brass;
      meshes.push(token);
    }
    this.aidMeshes.set(aid.id, meshes);
  }

  private createRestDesk() {
    const root = toWorld({ x: 0, z: 6 });
    const desk = MeshBuilder.CreateBox("rest-desk", { width: 0.74, depth: 0.5, height: 0.18 }, this.scene);
    desk.position = new Vector3(root.x, 0.16, root.z);
    desk.material = material(this.scene, "rest-desk-mat", "#785542", 0.08);
    const candle = MeshBuilder.CreateCylinder("rest-candle", { height: 0.24, diameter: 0.1 }, this.scene);
    candle.position = new Vector3(root.x + 0.14, 0.35, root.z);
    candle.material = material(this.scene, "rest-candle-mat", "#edc269", 0.45);
    this.boardMeshes.push(desk, candle);
  }

  private createPlayer() {
    const player = MeshBuilder.CreateCylinder("reader", { height: 0.42, diameterTop: 0.34, diameterBottom: 0.44, tessellation: 12 }, this.scene);
    player.material = material(this.scene, "reader-mat", "#f2e5c8", 0.1);
    player.position.y = 0.26;
    const ribbon = MeshBuilder.CreateBox("reader-ribbon", { width: 0.08, depth: 0.46, height: 0.08 }, this.scene);
    ribbon.position.y = 0.29;
    ribbon.material = material(this.scene, "reader-ribbon-mat", "#c84a36", 0.18);
    ribbon.parent = player;
    ribbon.position.z = -0.18;
    this.playerMesh = player;
  }

  private updatePlayerImmediate() {
    if (!this.playerMesh) return;
    const target = toWorld(this.position);
    this.playerMesh.position.x = target.x;
    this.playerMesh.position.z = target.z;
  }

  private removeBook(book: Book) {
    this.books = this.books.filter((candidate) => candidate.id !== book.id);
    this.bookMeshes.get(book.id)?.forEach((mesh) => mesh.dispose());
    this.bookMeshes.delete(book.id);
  }
}
