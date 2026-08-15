/**
 * Design context — "書庫銅版画": the 3D shelf remains the left page; the HUD is
 * a quiet marginal note. Reader is deliberately separate and fully accessible.
 */
import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { getStory, storyCatalog } from "@/content/storyCatalog";
import { assets } from "@/game/assets";
import { createGameScene, type GameHandle } from "@/game/scene";
import type { GameAction, GameSnapshot, Genre } from "@/game/types";
import BookEncounter from "./BookEncounter";
import DirectionPad from "./DirectionPad";
import Reader from "./Reader";

const EMPTY_SNAPSHOT: GameSnapshot = { mode: "title", ending: null, chapter: 1, age: 38, clarity: 100, clarityLabel: "くっきり読める", vigor: 22, maxVigor: 22, turns: 0, tsundoku: [], memory: [], aids: [], activeBook: null, activeBookCarried: false, pendingAbility: null, canRest: false, specialReady: [], log: ["棚の隙間に、まだ読んでいない夜がある。"], score: 120, routeHint: null, finalNote: null, chapterObjective: { prompt: "今夜の一冊を選ぶ。", targetTitle: "火星の読書室", targetGenre: "sf", chapterRead: false, inquiryCompleted: false, bookmarks: 0 } };

const GENRE_LABEL: Record<Genre, string> = { sf: "SF", mystery: "ミステリ", literature: "文学", philosophy: "哲学", practical: "実用書", cooking: "料理本" };
const DEMO_ROUTE: GameAction[] = [{ type: "move", dx: 0, dz: -1 }, { type: "move", dx: 0, dz: -1 }, { type: "move", dx: 0, dz: -1 }, { type: "move", dx: 1, dz: 0 }, { type: "move", dx: 0, dz: 1 }, { type: "move", dx: 0, dz: 1 }, { type: "move", dx: 0, dz: 1 }];

function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const width = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return <div className="meter" aria-label={`${label} ${value}/${max}`}><div className="meter__track"><span className="meter__fill" style={{ width: `${width}%` }} /></div><span className="meter__value">{value}</span></div>;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<GameHandle | null>(null);
  const startedRef = useRef(false);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const gameRef = useRef<GameSnapshot>(EMPTY_SNAPSHOT);
  const readerOpenRef = useRef(false);
  const [game, setGame] = useState<GameSnapshot>(EMPTY_SNAPSHOT);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [readerStoryId, setReaderStoryId] = useState<string | null>(() => typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("reader"));
  const isDemo = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");
  const readerStory = getStory(readerStoryId);
  const issue = (action: GameAction) => handleRef.current?.act(action);
  const nearTextBlur = Math.min(0.8, Math.max(0, (76 - game.clarity) / 32));
  const isExploring = game.mode === "exploring";

  useEffect(() => { readerOpenRef.current = Boolean(readerStory); }, [readerStory]);
  const receiveSnapshot = (snapshot: GameSnapshot) => { gameRef.current = snapshot; setGame(snapshot); };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (readerOpenRef.current) return;
      const actions: Record<string, GameAction> = { ArrowUp: { type: "move", dx: 0, dz: 1 }, w: { type: "move", dx: 0, dz: 1 }, W: { type: "move", dx: 0, dz: 1 }, ArrowDown: { type: "move", dx: 0, dz: -1 }, s: { type: "move", dx: 0, dz: -1 }, S: { type: "move", dx: 0, dz: -1 }, ArrowLeft: { type: "move", dx: -1, dz: 0 }, a: { type: "move", dx: -1, dz: 0 }, A: { type: "move", dx: -1, dz: 0 }, ArrowRight: { type: "move", dx: 1, dz: 0 }, d: { type: "move", dx: 1, dz: 0 }, D: { type: "move", dx: 1, dz: 0 } };
      if (actions[event.key] && gameRef.current.mode === "exploring") { event.preventDefault(); issue(actions[event.key]); return; }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (gameRef.current.mode === "title") issue({ type: "start" });
        else if (gameRef.current.mode === "chapterClear") issue({ type: "advance" });
        else if (gameRef.current.mode === "ending") issue({ type: "restart" });
      }
    };
    createGameScene(engine, canvas, receiveSnapshot).then((handle) => { if (cancelled) { handle.dispose(); return; } handleRef.current = handle; engine.runRenderLoop(() => handle.scene.render()); });
    let demoStep = 0;
    const demoTimer = isDemo ? window.setInterval(() => { const state = gameRef.current; if (state.mode === "title") issue({ type: "start" }); else if (state.mode === "exploring" && demoStep < DEMO_ROUTE.length) { issue(DEMO_ROUTE[demoStep]); demoStep += 1; } }, 460) : null;
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    return () => { cancelled = true; window.removeEventListener("resize", onResize); window.removeEventListener("keydown", onKeyDown); if (demoTimer !== null) window.clearInterval(demoTimer); handleRef.current?.dispose(); handleRef.current = null; engine.dispose(); startedRef.current = false; };
  }, [isDemo]);

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => { if (!readerOpenRef.current && gameRef.current.mode === "exploring") swipeRef.current = { x: event.clientX, y: event.clientY }; };
  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const origin = swipeRef.current; swipeRef.current = null;
    if (!origin || readerOpenRef.current || gameRef.current.mode !== "exploring") return;
    const dx = event.clientX - origin.x; const dy = event.clientY - origin.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
    issue(Math.abs(dx) > Math.abs(dy) ? { type: "move", dx: dx > 0 ? 1 : -1, dz: 0 } : { type: "move", dx: 0, dz: dy > 0 ? -1 : 1 });
  };
  const openReader = () => { if (game.activeBook) setReaderStoryId(game.activeBook.storyId); };
  const finishReading = () => { setReaderStoryId(null); issue({ type: "read" }); };
  const special = (genre: Genre) => issue({ type: "special", ability: genre });

  return (
    <main className="game-shell" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,8,24,.2), rgba(7,8,24,.72)), url(${assets.shelfBackdrop})` }}>
      <canvas ref={canvasRef} className="game-canvas" style={{ touchAction: "none" }} onPointerDown={onPointerDown} onPointerUp={onPointerUp} />
      <div className="ink-wash" aria-hidden="true" />
      <header className="brand-spine"><img src={assets.mark} alt="積読ダンジョンの書架印" className="brand-mark" /><div><p className="eyebrow">A SMALL ROGUELIKE FOR READERS</p><h1>積読ダンジョン</h1></div><span className="chapter-chip">第 {game.chapter} 章</span></header>
      {game.mode !== "title" && game.mode !== "ending" && <section className="shelf-guide" aria-label="書架迷路の案内"><p>書 架 迷 路 <span>9 × 7</span></p><b>背表紙のあいだを歩く。</b><small>朱墨は選択、黄銅は出口。</small><div className={`chapter-contract ${game.chapterObjective.chapterRead ? "is-open" : ""}`}><span>今夜の問い</span><strong>{game.chapterObjective.prompt}</strong><em>{game.chapterObjective.chapterRead ? "頁の鍵が開いた" : `探す本：『${game.chapterObjective.targetTitle}』`}</em></div></section>}
      {isExploring && <aside className={`marginalia ${dossierOpen ? "is-open" : ""}`} aria-label="読書の欄外注">
        <div className="folio"><span>AGE</span><strong>{game.age}</strong><em>歳</em></div>
        <section className="status-block"><p className="status-label">余白 <span>VIGOR</span></p><Meter value={game.vigor} max={game.maxVigor} label="余白" /><p className="status-label">文字の輪郭 <span>CLARITY</span></p><Meter value={game.clarity} max={100} label="文字の輪郭" /><p className="clarity-note">{game.clarityLabel}</p></section>
        <section className="margin-section tsundoku-section"><div className="section-heading"><span>積読</span><small>{game.tsundoku.length} / 4</small></div><div className="tsundoku-books">{game.tsundoku.length ? game.tsundoku.map((book) => <span className={`mini-book ${book.genre}`} key={book.id} title={book.title} />) : <i>まだ、腕は軽い。</i>}</div></section>
        <section className="margin-section contract-section"><div className="section-heading"><span>頁の鍵</span><small>{game.chapterObjective.chapterRead ? "OPEN" : "SEALED"}</small></div><p>{game.chapterObjective.chapterRead ? "読んだ一冊が、梯子を開いた。" : `『${game.chapterObjective.targetTitle}』は朱の栞をくれる。`}</p><div className="bookmark-count"><b>朱の栞</b><span>{game.chapterObjective.bookmarks}</span></div></section>
        <section className="margin-section"><div className="section-heading"><span>記憶の棚</span><small>{game.memory.length} / 3</small></div><div className="memory-list">{game.memory.length ? game.memory.map((ability) => <button type="button" className={`memory-tag ${ability.genre}`} key={ability.genre} onClick={() => special(ability.genre)} disabled={!game.specialReady.includes(ability.genre)} title={ability.description}><b>{ability.name}</b><span>{ability.short}</span></button>) : <i>読んだことだけが、道具になる。</i>}</div></section>
        <section className="margin-section aids-section"><div className="section-heading"><span>読みの補助具</span></div>{game.aids.length ? <div className="aid-list">{game.aids.map((aid) => <span key={aid.id}>{aid.name}</span>)}</div> : <i>灯りを探す。</i>}<img src={assets.readerAids} alt="読者と読書補助具の図版" className="aid-plate" /></section>
      </aside>}
      {isExploring && <button type="button" className="mobile-dossier-trigger" aria-expanded={dossierOpen} onClick={() => setDossierOpen((open) => !open)}>蔵書 <span>{dossierOpen ? "閉じる" : "開く"}</span></button>}
      {isExploring && <section className="reading-log" aria-live="polite"><p className="log-kicker">欄 外 注</p><p>{game.routeHint ?? game.log[0]}</p></section>}
      {game.canRest && isExploring && <div className="rest-actions"><button type="button" className="rest-prompt" onClick={() => issue({ type: "rest" })}>返却台で休む <span>−1 年輪 / 余白を戻す</span></button>{game.tsundoku[0] && <button type="button" className="unpack-prompt" onClick={() => issue({ type: "readCarried", id: game.tsundoku[0].id })}>積読を開く <span>ここで読む</span></button>}</div>}
      {isExploring && <DirectionPad issue={issue} />}
      {game.mode === "title" && <section className="overlay-card title-card" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,11,30,.96) 0%, rgba(10,11,30,.84) 45%, rgba(10,11,30,.45)), url(${assets.visualTarget})` }}><div className="plate-index">蔵書票 <b>001</b></div><div className="title-folio" aria-hidden="true"><span>TSUNDOKU</span><b>積</b><span>DUNGEON</span></div><div className="title-bookplate"><img src={assets.mark} alt="三冊の本と地下階段をかたどる積読ダンジョンの書架印" /><div><span>EX LIBRIS / MIDNIGHT SHELF</span><strong>積読ダンジョン</strong><em>未読は、たいてい明日より早く増える。</em></div></div><p className="card-overline">READ LESS. CHOOSE MORE.</p><h2>一冊を読む。<br />二冊を抱える。<br /><em>どちらも、時間を使う。</em></h2><p className="title-copy">本棚の奥にある四つの章を越え、最奥の梯子へ。各章で一冊を読み、どの答えを携えるかを選ぶ。抱えた未読本は重く、読むほど年輪は増える。</p><div className="genre-key" aria-label="本のジャンル">{Object.entries(GENRE_LABEL).map(([genre, label]) => <span key={genre} className={genre}>{label}</span>)}</div><button type="button" className="primary-button" onClick={() => issue({ type: "start" })}>棚の奥へ入る <span>↵</span></button><p className="input-note">矢印 / WASD / スワイプで移動　・　一冊読めば梯子が開く</p></section>}
      {game.mode === "bookChoice" && game.activeBook && <BookEncounter book={game.activeBook} carried={game.activeBookCarried} blur={nearTextBlur} objective={{ isTarget: game.activeBook.title === game.chapterObjective.targetTitle, chapterRead: game.chapterObjective.chapterRead }} onRead={openReader} onCarry={() => issue({ type: "carry" })} onLeave={() => issue({ type: "leave" })} />}
      {game.mode === "memoryChoice" && game.pendingAbility && <section className="overlay-card memory-card"><p className="card-overline">記憶の棚は三冊ぶん</p><h2>「{game.pendingAbility.name}」を置くために、<br />一冊を忘れてください。</h2><p className="choice-warning">残すこともまた、読むことの一部です。</p><div className="memory-replace-grid">{game.memory.map((ability) => <button type="button" key={ability.genre} onClick={() => issue({ type: "replaceMemory", genre: ability.genre })}><b>{ability.name}</b><span>{ability.description}</span></button>)}<button type="button" className="replace-new" onClick={() => issue({ type: "replaceMemory", genre: null })}><b>残さない</b><span>今回の本は、今夜だけの読書にする</span></button></div></section>}
      {game.mode === "chapterClear" && <section className="overlay-card chapter-card"><p className="card-overline">CHAPTER {game.chapter} — SHELVED</p><h2>梯子を見つけた。<br /><em>まだ、降りられる。</em></h2><p>次の棚では、本の並びも、あなたの目も少し変わる。</p><button type="button" className="primary-button" onClick={() => issue({ type: "advance" })}>次の章へ <span>↓</span></button></section>}
      {game.mode === "ending" && <section className="overlay-card ending-card" style={{ backgroundImage: `linear-gradient(120deg, rgba(8,9,25,.96), rgba(8,9,25,.72)), url(${assets.visualTarget})` }}><p className="card-overline">{game.ending === "clear" ? "THE LAST LADDER" : "THE SHELF REMAINS"}</p><h2>人は老いる。<br /><em>だが読む。</em></h2><p className="ending-note">{game.finalNote}</p><div className="ending-stats"><span>第 {game.chapter} 章</span><span>{game.age} 歳</span><span>積読 {game.tsundoku.length} 冊</span><span>頁の余白 {game.score}</span></div><button type="button" className="primary-button" onClick={() => issue({ type: "restart" })}>別の棚を開く <span>↻</span></button></section>}
      {readerStory && <Reader story={readerStory} onBack={() => setReaderStoryId(null)} onComplete={finishReading} />}
    </main>
  );
}
