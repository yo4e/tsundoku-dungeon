# アーキテクチャ — Reactの額縁、Babylonの盤面

## 全体像

Reactはゲームを収める見開き頁、欄外UI、読書選択、タッチ操作を担当する。Babylon.jsは書架盤面、プレイヤー、壁、本、補助具、梯子、照明を描画する。ゲームの規則はReactに依存しない `client/src/game/` のTypeScriptとして持ち、表示側は状態スナップショットを購読する。

```text
GameCanvas.tsx
  ├─ Babylon Engine / canvas lifecycle
  ├─ DOM HUD / title / choice dialogs / touch controls
  └─ createGameScene()
       └─ GameWorld
            ├─ chapter layout and interaction state
            ├─ book, aid, tsundoku, memory rules
            ├─ Babylon meshes and material ownership
            └─ UI snapshot emission
```

## 主要モジュール

| ファイル | 責務 |
|---|---|
| `client/src/components/GameCanvas.tsx` | Babylonの初期化と破棄、キーボード・スワイプ・ボタン入力、DOM UI、`?demo`の固定デモルート。 |
| `client/src/game/scene.ts` | Scene、正射影カメラ、ライト、レンダーループを作る。 |
| `client/src/game/GameWorld.ts` | 章の書架配置、状態遷移、ジャンル効果、積読・老化・補助具の計算、Babylonメッシュの生成と破棄。 |
| `client/src/game/types.ts` | `GameAction`、`GameSnapshot`、`Book`、`Aid`、`Ability`などの語彙を定義する。 |
| `client/src/game/assets.ts` | 生成アセットを安定したURLとして管理する。 |
| `client/src/index.css` | 見開き頁、欄外、表紙、モバイル表示、アクセシビリティ対応を定義する。 |

## 状態遷移

`title → exploring → bookChoice → memoryChoice → chapterClear → ending` の状態を明示する。返却台では、探索から休息または積読読了へ入る。ゲーム状態は `GameSnapshot` としてUIに渡し、UIは `GameAction` をワールドに返す。

| 状態 | 入力 | 遷移先 | 目的 |
|---|---|---|---|
| `title` | 開始 | `exploring` | 今夜の探索を始める。 |
| `exploring` | 移動 | `exploring` / `bookChoice` / `chapterClear` | 盤面を一手進み、遭遇を解決する。 |
| `bookChoice` | 読む・抱える・見送る | `exploring` / `memoryChoice` | 本と時間の関係を選ぶ。 |
| `memoryChoice` | 置換・残さない | `exploring` | 3冊の記憶枠を管理する。 |
| `chapterClear` | 次の章へ | `exploring` | 年齢を進め、次の書架を生成する。 |
| `ending` | 再開 | `exploring` | セーブなしの新しい1ランを始める。 |

## 入力とレスポンシブ対応

PCは矢印キーとWASDで移動し、EnterまたはSpaceで主選択を実行できる。スマホは盤面スワイプと大きな方向ボタンを併用する。HUDはデスクトップでは右欄外、スマホでは下部の栞型の情報帯へ変形する。

## 検証

次のコマンドで型と配布用ビルドを確認する。

```bash
pnpm check
pnpm build
```

`/?demo` は固定の行動列で開始・移動・読書選択まで進むため、スクリーンショットで探索画面を確認する用途に使う。BabylonのエンジンはReactコンポーネントの破棄時に破棄し、ウィンドウ入力とリサイズ監視も同時に解除する。
