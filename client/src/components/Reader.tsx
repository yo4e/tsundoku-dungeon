/**
 * Design context — the Reader is a real, accessible paper page, not an in-game
 * modal. Parchment, restrained vermilion, and generous Japanese typesetting
 * take priority over the dungeon's intentional perceptual friction.
 */
import { useEffect, useRef, useState } from "react";
import type { Story } from "@/content/storyCatalog";

const SIZE_KEY = "tsundoku-reader-font-size";
const FONT_SIZES = ["small", "medium", "large"] as const;
type ReaderSize = (typeof FONT_SIZES)[number];

const SIZE_LABEL: Record<ReaderSize, string> = { small: "小", medium: "中", large: "大" };

export default function Reader({ story, onBack, onComplete }: { story: Story; onBack: () => void; onComplete: () => void }) {
  const shellRef = useRef<HTMLElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState<ReaderSize>(() => {
    const stored = window.localStorage.getItem(SIZE_KEY);
    return FONT_SIZES.includes(stored as ReaderSize) ? (stored as ReaderSize) : "medium";
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onBack]);

  useEffect(() => {
    shellRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    backButtonRef.current?.focus();
  }, [story.id]);

  const chooseSize = (next: ReaderSize) => {
    setSize(next);
    window.localStorage.setItem(SIZE_KEY, next);
  };

  return (
    <article ref={shellRef} className={`reader-shell reader-size-${size}`} role="dialog" aria-modal="true" aria-label={`『${story.title}』を読む`}>
      <header className="reader-toolbar">
        <button ref={backButtonRef} type="button" className="reader-back" onClick={onBack}>← <span>本棚へ戻る</span></button>
        <div className="reader-running-title"><small>{story.byline}</small><strong>『{story.title}』</strong></div>
        <div className="reader-size-picker" aria-label="文字サイズ">
          <span>Aa</span>
          {FONT_SIZES.map((option) => <button type="button" key={option} className={size === option ? "is-active" : ""} onClick={() => chooseSize(option)} aria-pressed={size === option}>{SIZE_LABEL[option]}</button>)}
        </div>
      </header>
      <main className="reader-page">
        <p className="reader-genre">{story.genre.toUpperCase()} / 蔵書票 001</p>
        <h1>{story.title}</h1>
        <p className="reader-byline">{story.byline}</p>
        <div className="reader-rule" />
        <div className="reader-prose">
          {story.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
        <section className="reader-finish">
          <span className="reader-endmark">了</span>
          <p>頁を閉じると、物語は静かにあなたの棚へ戻る。</p>
          <button type="button" className="reader-complete" onClick={onComplete}>本を閉じる <span>→</span></button>
          <small>読み終えた本の力だけを、持ち帰る。</small>
        </section>
      </main>
    </article>
  );
}
