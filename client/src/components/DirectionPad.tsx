/** Design context — tactile brass-edged controls remain thumb-sized on mobile. */
import type { GameAction } from "@/game/types";

export default function DirectionPad({ issue }: { issue: (action: GameAction) => void }) {
  return (
    <div className="direction-pad" aria-label="移動操作">
      <button type="button" className="dir-btn dir-up" onClick={() => issue({ type: "move", dx: 0, dz: -1 })} aria-label="上へ移動">↑</button>
      <button type="button" className="dir-btn dir-left" onClick={() => issue({ type: "move", dx: -1, dz: 0 })} aria-label="左へ移動">←</button>
      <button type="button" className="dir-btn dir-right" onClick={() => issue({ type: "move", dx: 1, dz: 0 })} aria-label="右へ移動">→</button>
      <button type="button" className="dir-btn dir-down" onClick={() => issue({ type: "move", dx: 0, dz: 1 })} aria-label="下へ移動">↓</button>
    </div>
  );
}
