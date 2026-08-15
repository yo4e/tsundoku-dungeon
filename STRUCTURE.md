# 積読ダンジョン — 構造

## 責務の境界

Reactはゲームを収める見開き頁とDOM上の補助UIを描画し、Babylonは盤面、照明、書架セル、プレイヤー、拾得物の場面を描画する。**勝敗・盤面生成・読書効果・年齢進行はすべてフレームワーク非依存のTypeScript**として `client/src/game/` に置く。Reactコンポーネントは表示用スナップショットを購読し、入力を意味論的なアクションとしてワールドへ渡すだけにする。

```text
App.tsx
  └─ GameCanvas.tsx
       ├─ Babylon Engine / createGameScene()
       └─ 書庫欄外UI（Snapshotの表示・入力送信）

game/scene.ts
  └─ GameWorld
       ├─ DungeonFactory（接続可能な章の生成）
       ├─ Player（座標・余白・積読・年輪・補助具）
       ├─ BookSystem（本の選択・読了・記憶能力）
       ├─ RenderBoard（Babylonメッシュとマテリアル）
       └─ InputManager（keyboard / pointer / swipe → GameAction）
```

## 主要データ

| 型 | 役割 | 主要な値 |
|---|---|---|
| `Genre` | 本の分類 | `sf`, `mystery`, `literature`, `philosophy`, `practical`, `cooking` |
| `Book` | 盤面上または積読中の本 | `id`, `genre`, `title`, `effect`, `read` |
| `Aid` | 可読性を補う道具 | `glasses`, `contacts`, `ereader`, `lamp` |
| `PlayerState` | 一手で更新される人生の状態 | `pos`, `age`, `clarity`, `vigor`, `tsundoku`, `memory`, `aids` |
| `Chapter` | 1冊ぶんの書架階層 | `grid`, `exit`, `floor`, `turns`, `seed` |
| `GameAction` | UIからゲームへ渡す意味論的な入力 | `move`, `read`, `carry`, `leave`, `rest`, `restart` |
| `UISnapshot` | UIに公開する安全な表示状態 | ステータス、近傍本、ログ、モーダル、終了状態 |

## 状態機械

ゲームは `title → exploring → bookChoice → memoryChoice → chapterClear → ending` を明示的に遷移する。`bookChoice` では隣接する本を読む、抱える、見送る。`memoryChoice` は記憶枠が3冊で満杯の場合だけ表示し、能力を1つ手放して差し替える。探索中の一手は年輪を進め、可読性・余白・積読負荷を再計算してから、敗北とクリアを判定する。

## Asset Hints

Babylonの書架地形は、処理の軽い薄い箱メッシュと生成済みの背景テクスチャを組み合わせる。見せ場となる開始画面、紙の粒子感、ジャンル本、読者トークン、補助具、ロゴには生成画像を直接表示する。小さく可読性が必要な情報、罫線、矢印、HUDのゲージはプロシージャルなSVG/CSSまたはBabylonの単色メッシュで描き、画像を縮小しすぎない。

## 入力方針

PCでは矢印キー・WASDで移動し、EnterまたはSpaceで隣接本を読む。スマホでは盤面スワイプと画面下の十字型ボタンを同時に提供する。移動アクションは120msの短い入力ロックを持ち、積読が重いほど盤面側の移動トランジションだけを長くする。操作受理自体は常に即時で、連続入力が失われないようにする。
