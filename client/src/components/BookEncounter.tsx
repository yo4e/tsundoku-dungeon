/** Design context — this encounter is a slim bookplate: decision first, lore second. */
import type { Book, Genre } from "@/game/types";

const GENRE_LABEL: Record<Genre, string> = { sf: "SF", mystery: "ミステリ", literature: "文学", philosophy: "哲学", practical: "実用書", cooking: "料理本" };

export default function BookEncounter({ book, carried, blur, onRead, onCarry, onLeave }: { book: Book; carried: boolean; blur: number; onRead: () => void; onCarry: () => void; onLeave: () => void }) {
  return (
    <section className="overlay-card decision-card" role="dialog" aria-label={`『${book.title}』との遭遇`}>
      <div className={`book-swatch ${book.genre}`}><span>{GENRE_LABEL[book.genre]}</span></div>
      <div className="decision-copy" style={blur ? { filter: `blur(${blur}px)` } : undefined}>
        <p className="card-overline">棚からの呼び声</p>
        <h2>『{book.title}』</h2>
        <p className="byline">{book.byline}　—　{book.effect}</p>
        <p className="choice-warning">読むと <b>余白 −1</b>、年輪は進む。抱えると積読になり、これからの余白が狭くなる。</p>
      </div>
      <div className="choice-actions">
        <button type="button" className="primary-button" onClick={onRead}>今、読む <small>短編を開く</small></button>
        {!carried && <button type="button" className="secondary-button" onClick={onCarry}>抱える <small>積読になる</small></button>}
        <button type="button" className="text-button" onClick={onLeave}>{carried ? "積読に戻す" : "棚に残す"}</button>
      </div>
    </section>
  );
}
