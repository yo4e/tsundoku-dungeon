/** Design context — this encounter is a slim bookplate: decision first, lore second. */
import { useEffect, useRef } from "react";
import { getStory } from "@/content/storyCatalog";
import type { Book, Genre } from "@/game/types";

const GENRE_LABEL: Record<Genre, string> = { sf: "SF", mystery: "ミステリ", literature: "文学", philosophy: "哲学", practical: "実用書", cooking: "料理本" };

export default function BookEncounter({ book, carried, blur, objective, onRead, onCarry, onLeave }: { book: Book; carried: boolean; blur: number; objective: { isTarget: boolean; chapterRead: boolean }; onRead: () => void; onCarry: () => void; onLeave: () => void }) {
  const story = getStory(book.storyId);
  const readButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { readButtonRef.current?.focus(); }, [book.id]);

  return (
    <section className="overlay-card decision-card" role="dialog" aria-modal="true" aria-label={`『${book.title}』との遭遇`}>
      <div className={`book-swatch ${book.genre}`}><span>{GENRE_LABEL[book.genre]}</span></div>
      <div className="decision-copy">
        <p className="card-overline">棚からの呼び声</p>
        <div className="story-metadata" style={blur ? { filter: `blur(${blur}px)` } : undefined}>
          <h2>『{book.title}』</h2>
          <p className="story-hook">{story?.hook}</p>
          <p className="byline">{book.byline}</p>
        </div>
        <div className="decision-facts"><span>{story ? `約${story.readingMinutes}分` : "短編"}</span><span>読了効果：{book.effect}</span></div>
        <p className={`contract-note ${objective.isTarget ? "is-target" : ""}`}>{objective.chapterRead ? "頁の鍵は開いている。ここで読むかは、あなたが選べる。" : objective.isTarget ? "今夜の問いに応える本。読了で梯子が開き、朱の栞が余白を2戻す。" : "別の答えでも読了すれば梯子は開く。問いの本なら朱の栞も得る。"}</p>
        <p className="choice-warning">今読むと <b>余白 −1</b>、年輪が進む。抱えると積読になり、これからの余白が狭くなる。</p>
      </div>
      <div className="choice-actions">
        <button ref={readButtonRef} type="button" className="primary-button" onClick={onRead}>今、読む <small>短編を開く</small></button>
        {!carried && <button type="button" className="secondary-button" onClick={onCarry}>抱える <small>積読になる</small></button>}
        <button type="button" className="text-button" onClick={onLeave}>{carried ? "積読に戻す" : "棚に残す"}</button>
      </div>
    </section>
  );
}
