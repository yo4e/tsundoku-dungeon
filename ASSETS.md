# Assets

**Art direction:** 19世紀の銅版画と和製古書の装丁を重ねた「書庫銅版画」。墨紺の書庫に生成りの紙、黄銅の細線、朱墨の栞を使い、細密な線画と紙の手触りを保ちながら、ゲーム内の可読性を優先する。

> 注：以下は生成を開始した資産のURLである。生成中のプレースホルダーは同じURLのまま完成画像に置き換わる。

## Backgrounds

| Name | Description | Size | Image |
|---|---|---:|---|
| visual target | 画面構図の指標。書架盤面・欄外・本・出口を含むゲーム画面。 | 1920×1080 px、開始画面の全幅背景 | `/manus-storage/tsundoku-visual-target_5a2589b4.png` |
| shelf backdrop | 盤面背後とタイトル画面で使う、墨紺と胡桃色の書架テクスチャ。 | 1920×1080 px、全画面 | `/manus-storage/tsundoku-shelf-backdrop_40e28dc2.png` |

## Sprites

| Name | Description | Size | Image |
|---|---|---:|---|
| genre book collection | SF、ミステリ、文学、哲学、実用書、料理本の装丁セット。表示上はCSSクリップで抜き出すか、書影参照として用いる。 | 160×210 px／冊 | `/manus-storage/tsundoku-book-collection_aa9c04b8.png` |
| reader and aids | 読者トークン、老眼鏡、読書灯、電子書籍端末。 | 読者160×160 px、補助具120×120 px | `/manus-storage/tsundoku-reader-and-aids_0d045fa7.png` |
| library mark | 三段の本が地下階段にも見える書架印。 | 112×112 px、ファビコンは32×32 px | `/manus-storage/tsundoku-library-mark_5a446500.png` |

## Usage Rules

タイトル開始画面と終了画面には `visual target` または `shelf backdrop` を大きく置き、上に置く文字には濃い墨紺のオーバーレイを重ねて、生成り色の見出しを必ず読めるようにする。ゲーム盤では背景を直接そのまま読ませず、メッシュ・半透明の紙レイヤーと組み合わせてセルの判別を守る。ロゴはヘッダーと開始画面で少なくとも48px以上に表示する。
