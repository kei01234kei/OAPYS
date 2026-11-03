---
version: alpha
name: OAPYS-design
description: Design guidance for OAPYS using restrained emerald accents, clear typography, fine borders, and structured product UI. Light surfaces and dark code or product panels provide a reference palette; the existing dark theme remains the starting point for implementation.

colors:
  primary: "#3ecf8e"
  primary-deep: "#24b47e"
  primary-soft: "#4ade80"
  ink: "#171717"
  ink-secondary: "#212121"
  ink-mute: "#707070"
  ink-mute-2: "#9a9a9a"
  ink-faint: "#b2b2b2"
  on-primary: "#171717"
  on-dark: "#ffffff"
  canvas: "#ffffff"
  canvas-soft: "#fafafa"
  canvas-night: "#1c1c1c"
  canvas-night-soft: "#202020"
  hairline: "#dfdfdf"
  hairline-strong: "#c7c7c7"
  hairline-cool: "#ededed"
  hairline-cool-2: "#efefef"
  hairline-cool-3: "#d4d4d4"
  accent-purple: "#6b01c2"
  accent-violet: "#644fc1"
  accent-purple-soft: "#eddbf9"
  accent-yellow: "#ffdb13"
  accent-tomato: "#ff2201"
  accent-pink: "#c7007e"
  accent-indigo: "#054cff"
  accent-crimson: "#e2005a"

typography:
  display-xxl:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 64px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -1.92px
  display-xl:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 48px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -1.44px
  display-lg:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 36px
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: -0.72px
  display-md:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.42px
  heading-lg:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0
  heading-md:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  body-lg:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-md:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button-md:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: 0
  caption:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  micro:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  code:
    fontFamily: "ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 64px

components:
  button-primary-green:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  button-primary-green-pressed:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  button-secondary-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  button-on-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  button-link:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.xs}"
    padding: 0px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  card-feature-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-pricing:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-pricing-featured:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-feature-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  code-block:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-dark}"
    typography: "{typography.code}"
    rounded: "{rounded.sm}"
    padding: 16px
  pill-tag-green:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.micro}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  pill-tag-soft:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.micro}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  nav-bar-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 16px 24px
  link-on-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 0px
  footer-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-mute}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 64px 24px
---

# OAPYS デザイン指針

[English](DESIGN.md) | **日本語**

この文書は OAPYS の視覚表現を整えるための指針です。上記の機械可読トークンは英語版と同一です。デザインの参考であり、実装済み機能を示すものではありません。ワークスペースはライト／ダークの両テーマに対応し、初期状態では OS の設定に従います。

## 現在の実装

ライトモードは背景・境界線・文字を白とニュートラルグレーで統一します。資産アイコンとグラフの線は無彩色とし、重要度の色は小さなバッジ・点・状態ラベルに限定します。エメラルドは主要操作と小さな選択状態の印に絞り、パネル・ナビゲーション背景・グラフノード全体を状態色で染めません。

現在のホーム画面では、この節を以降の白い面を使う参考パターンより優先します。ヘッダーで「OS に合わせる／ライト／ダーク」を選択できます。`src/app/globals.css` の共通の意味別カラー変数で、背景・文字・状態色・SVG グラフを管理します。初回描画前に選択したテーマを反映し、手動の選択はブラウザに保存します。以降のコンポーネント案はすべてが実装済みではありません。

| 役割 | 実装 |
|---|---|
| 背景 / パネル / 境界線 | メインは白、サイドバーと補助面は `#fafafa`、境界線は `#e5e5e5`（ライト）。ダークテーマも維持 |
| 文字 / 補足文字 | `#171717` / `#707070`（ライト）、`#e9eeeb` / `#8b9b91`（ダーク） |
| アクセント | エメラルド `#3ecf8e`。主要操作と小さな選択インジケーターに限定 |
| 書体 | 日本語フォールバックを含むシステムのサンセリフ体。技術ラベルはシステム等幅書体 |
| 文字サイズ | 基本文字 15px、本文 14〜16px、補足 12〜13px。画面が狭くても文字を縮小しない |
| 見出し | ページ 32px（モバイル 28px）、セクション 22px（モバイル 20px）、ウェイト 500 |
| 数値 | サマリー 36px（モバイル 32px） |
| ボタン / パネル | 角丸 6px / 12px。主要ボタンの高さ 42px 以上、アイコン操作 36px |
| コンテンツ配置 | 最大 1760px。サイドバー 248px。1250px 以下ではサマリーを 2 列、グラフ詳細を下部に配置 |
| AI 調査 | 1050px 以下では入力と結果を縦に配置。手順説明は折りたたみ、入力と結果を優先 |
| 余白 | パネル内 24〜28px、モバイル 16〜20px。ページ見出しの下は 32px |

[ARTEX のダッシュボード](https://github.com/jiwoochris/artex-global) を参考に、大きめの文字、ニュートラルな背景、細い境界線、十分な余白で構成します。宣伝的な見出しや重複する英語ラベルを減らし、日本語の短い操作名を使います。画面が狭い場合は折り返しと縦配置で対応します。SVG ラベルはグラフ座標系に合わせて個別に調整します。

接続状態は文字と色を併用します。デモ・実環境の区別、AI への送信同意、所有確認と診断の認可の流れを維持します。

## 概要

このデザイン言語は明快さを優先します。マーケティング画面は白の `{colors.canvas}` を背景とし、文字には純黒ではない `{colors.ink}`（`#171717`）を使います。一貫した有彩色はエメラルドグリーンの `{colors.primary}`（`#3ecf8e`）だけで、塗りの CTA、アクセントの点、ワードマークの強調に使います。それ以外は `#ededed` から `#171717` までのグレー階調が中心です。

書体は Circular。見出しはウェイト 500、本文は 400。64px の見出しでは字間を -1.92px にして、丸みのある字形を引き締めます。背景グラデーション、画面全面の写真、暗色背景のマーケティング画面は使わず、白を基調にします。

製品そのものを示すダッシュボード表、SQL エディター、クエリービルダー、ログのスクリーンショットが視覚表現の中心です。角丸 12px、細い 1px の境界線を持つコンテナーに収め、2 列または重なったパネルとしてヒーローの上に配置します。

主な特徴:

- エメラルドを CTA、アクセントの点、ワードマークに限定し、残りはモノクロにする。
- 白いマーケティング画面とグレーの階調で情報の優先順位を表す。
- 見出しはウェイト 500、字間は -1.92px〜-0.42px。
- 写真やイラストより、製品 UI の合成スクリーンショットを使う。
- ボタンは角丸 6px / 8px の四角に近い形にし、ピル型にしない。
- コードブロックは暗い `{colors.canvas-night}`（`#1c1c1c`）、コードは等幅書体。
- 注目する料金プランは緑ではなく暗色で反転させ、緑をボタンと点に残す。

## 色

### ブランドとアクセント

| トークン | 値 | 用途 |
|---|---|---|
| `primary` | `#3ecf8e` | CTA の塗り、ワードマーク、点 |
| `primary-deep` | `#24b47e` | 押下状態 |
| `primary-soft` | `#4ade80` | チャートと製品 UI の補助アクセント |
| `accent-purple` | `#6b01c2` | 連携ロゴ、チャートの点。ボタンには使わない |
| `accent-violet` | `#644fc1` | 紫と同様の補助用途 |
| `accent-yellow` | `#ffdb13` | チャート、状態表示のみ |
| `accent-pink` | `#c7007e` | 連携ロゴ、まれなチャートの強調 |
| `accent-crimson` | `#e2005a` | 同上 |
| `accent-indigo` | `#054cff` | 同上 |
| `accent-tomato` | `#ff2201` | 同上 |

ピンク、クリムゾン、インディゴ、トマトはシステムの基本色には使いません。

### 背景と境界線

| トークン | 値 | 用途 |
|---|---|---|
| `canvas` | `#ffffff` | ページ背景 |
| `canvas-soft` | `#fafafa` | 交互のセクション背景 |
| `canvas-night` | `#1c1c1c` | コード、ダッシュボード見本、注目料金プラン |
| `canvas-night-soft` | `#202020` | 暗色 UI 内の一段明るい面 |
| `hairline` | `#dfdfdf` | カードと表の 1px 境界線 |
| `hairline-strong` | `#c7c7c7` | 強めの境界線 |
| `hairline-cool` | `#ededed` | 細部の境界線 |
| `hairline-cool-2` | `#efefef` | 同上 |
| `hairline-cool-3` | `#d4d4d4` | 同上 |

### 文字

| トークン | 値 | 用途 |
|---|---|---|
| `ink` | `#171717` | 本文。純黒を避ける |
| `ink-secondary` | `#212121` | 本文の強調 |
| `ink-mute` | `#707070` | 補足文 |
| `ink-mute-2` | `#9a9a9a` | 第三階層の情報 |
| `ink-faint` | `#b2b2b2` | 無効状態、プレースホルダー |
| `on-primary` | `#171717` | 緑のボタン上の文字。白にはしない |
| `on-dark` | `#ffffff` | 暗い面の上の文字 |

## タイポグラフィ

### 書体

見出しと UI は Lineto の有償書体 Circular。フォールバックは `'Helvetica Neue', Helvetica, Arial` です。

Circular のライセンスがない場合は、オープンソースの Inter をウェイト 500、64px の見出しでは字間 -1.92px で使うことをこの指針では提案しています。Geist Sans も本文と見出しの代替候補です。この指針では Helvetica を第一選択にすることを避けるよう勧めています。

コードは `ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', monospace`。専用の有償等幅 Web フォントは使いません。

### 階層

| トークン | サイズ | ウェイト | 行高 | 字間 | 用途 |
|---|---|---|---|---|---|
| `display-xxl` | 64px | 500 | 1.1 | -1.92px | ヒーロー見出し |
| `display-xl` | 48px | 500 | 1.1 | -1.44px | セクション冒頭 |
| `display-lg` | 36px | 500 | 1.15 | -0.72px | 小セクション、料金 |
| `display-md` | 28px | 500 | 1.2 | -0.42px | カード見出し |
| `heading-lg` | 22px | 500 | 1.2 | 0 | 小さめの見出し |
| `heading-md` | 18px | 500 | 1.4 | 0 | セクションの副見出し |
| `body-lg` | 18px | 400 | 1.55 | 0 | 導入文 |
| `body-md` | 16px | 400 | 1.5 | 0 | 標準 UI 本文 |
| `button-md` | 14px | 500 | 1.0 | 0 | ボタン |
| `caption` | 13px | 400 | 1.45 | 0 | 補足、脚注 |
| `micro` | 12px | 400 | 1.45 | 0 | タグ、細かな注記 |
| `code` | 14px | 400 | 1.5 | 0 | コード |

見出しは中程度の太さを保ち、64px の -1.92px から比例して字間を調整します。コードには常に等幅書体を使います。

## レイアウト

### 余白

基本単位は 8px。細かな調整には 2 / 4 / 12px を使います。

| トークン | 値 |
|---|---|
| `xxs` | 2px |
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 24px |
| `xxl` | 32px |
| `huge` | 64px |

マーケティング画面のセクションには 64〜96px、機能・料金カードの内部には 32px の余白を取ります。

### グリッドとコンテナー

- マーケティング画面は約 1280px の中央コンテナーに収め、画面端まで広げない。
- 料金プランは 1024 / 768px の境界で 4 列 → 2 列 → 1 列にする。
- 製品 UI は同じコンテナー内で 2 列、または重ねたパネルとして表示する。

白い余白そのものをデザインとし、空白をグラデーションで埋めません。セクション間の変化には製品 UI の合成を使います。

## 高さと奥行き

| レベル | 表現 | 用途 |
|---|---|---|
| 0 | 平面、1px の境界線 | 標準カード |
| 1 | `0 1px 3px rgba(0,0,0,0.06)` | ごく小さな浮き上がり |
| 2 | `0 8px 24px rgba(0,0,0,0.08)` | 浮かせた製品 UI |
| 3 | `0 16px 48px rgba(0,0,0,0.12)` | モーダル |

奥行きはグラデーションではなく、ダッシュボード、SQL エディター、ログのパネルをレベル 2 の影で重ねて表します。

## 形

| トークン | 値 | 用途 |
|---|---|---|
| `rounded.xs` | 4px | 入力、細いタグ |
| `rounded.sm` | 6px | ボタン、コードブロック |
| `rounded.md` | 8px | 小型カード、アラート |
| `rounded.lg` | 12px | 料金・機能カード、製品 UI |
| `rounded.xl` | 16px | モーダル、大きなコンテナー |
| `rounded.full` | 9999px | ピル型タグ、アバター |

写真は最小限。顧客ロゴは高さ約 24〜32px のグレースケールで揃えます。まれに使う導入事例の写真は、4:3 で角丸 12px のコンテナー内に収めます。

## コンポーネント

以下の色・書体・角丸は上記トークンを参照します。

### ボタン

- `button-primary-green`: 背景 `primary`、文字 `on-primary`、書体 `button-md`、余白 8px 16px、角丸 6px。文字は白ではなく黒に近い色。
- `button-primary-green-pressed`: 押下時は背景を `primary-deep` に変更し、他は同じ。
- `button-secondary-outline`: 背景 `canvas`、文字 `ink`、1px の `hairline-strong` 境界線。書体、余白、角丸は主ボタンと同じ。
- `button-on-dark`: 背景 `canvas-night`、文字 `on-dark`。主ボタンと同じ形。
- `button-link`: 透明背景、文字 `ink`、書体 `button-md`、余白なし、角丸 4px。ホバー時に控えめな下線。機械可読トークンの背景値は `canvas`。

### カードとコンテナー

- `card-feature-light`: 背景 `canvas`、文字 `ink`、書体 `body-md`、余白 32px、角丸 12px、1px の `hairline` 境界線。
- `card-pricing`: 機能カードと同じ面。見出しは `heading-lg`、価格は `display-md`、本文は `body-md`、下端に `button-primary-green`。
- `card-pricing-featured`: 料金カードの背景を `canvas-night`、文字を `on-dark` に反転。他の構造は同じ。
- `card-feature-dark`: 背景 `canvas-night`、文字 `on-dark`、書体 `body-md`、余白 32px、角丸 12px。コード中心の機能説明に使う。
- `code-block`: 背景 `canvas-night`、文字 `on-dark`、書体 `code`、余白 16px、角丸 6px。

### 入力とフォーム

`text-input`: 背景 `canvas`、文字 `ink`、書体 `body-md`、余白 8px 12px、角丸 6px、1px の `hairline` 境界線。

### ナビゲーション

`nav-bar-light`: 背景 `canvas`、文字 `ink`、書体 `body-md`、余白 16px 24px、角丸 4px。左にロゴ、中央に主要リンク、右にサインインリンクと緑の主ボタン。

### タグ

- `pill-tag-green`: 背景 `primary`、文字 `on-primary`、書体 `micro`、余白 2px 8px、角丸 9999px。「新着」や注目情報に使う。
- `pill-tag-soft`: 背景 `canvas-soft`、文字 `ink`。他は緑のタグと同じ。

### 特徴的な要素とフッター

製品 UI の合成は、ダッシュボード、SQL エディター、ログを複数の層に重ね、レベル 2 の控えめな影を付けます。周囲に装飾を足さず、白い背景に置きます。

`link-on-light`: 文字 `ink`、書体 `body-md`、余白 0、角丸 4px、背景トークンは `canvas`。本文中のリンクには常時下線を付けます。

`footer-light`: 背景 `canvas`、文字 `ink-mute`、書体 `caption`、余白 64px 24px、角丸 4px。4〜5 列のリンク、ソーシャルアイコン、小さな法的注記を配置します。

## 推奨事項と避けること

### 推奨

- エメラルドは塗りの CTA とワードマークを中心に控えめに使う。
- 見出しはウェイト 500 と負の字間を保つ。
- ボタンは四角に近い角丸 6px。
- 製品 UI は角丸 12px とレベル 2 の影で合成する。
- 緑のボタンには黒に近い `ink` の文字を使う。
- コードブロックにはシステム等幅書体を使う。

### 避けること

- 紫、黄、ピンクを基本のシステム色として増やさない。チャートや連携ロゴの中に限定する。
- 見出しを 600 以上の太さにしない。
- ボタンをピル型にしない。
- 緑のボタンに白い文字を使わない。
- ヒーローに雰囲気づくりのグラデーションを追加しない。

## レスポンシブ対応

| 区分 | 幅 | 主な変更 |
|---|---|---|
| Wide | 1440px 以上 | コンテナーを十分に使い、製品 UI を原寸表示 |
| Desktop | 1024〜1440px | 標準最大幅、料金 4 列 |
| Tablet | 768〜1023px | 料金 2 列、製品 UI は単一パネルへ |
| Mobile | 768px 未満 | 料金 1 列、ハンバーガーナビ、見出し 64 → 36px |

この指針ではモバイルのボタンを 36×36px 以上、入力欄の高さを 36px 以上とし、WCAG AA の最小条件に触れています。これはこの指針の記述であり、サイズだけでアクセシビリティ全体への適合を示すものではありません。

見出しサイズは階層的に 64 → 48 → 36 → 28 → 22px。モバイルの製品 UI は主要な 1 パネルに絞り、料金は 4 → 2 → 1 列へ縮小します。注目プランの暗色表現は維持します。

製品 UI の画像にはデスクトップ・モバイル別の切り抜きと `srcset` を用意し、モバイルでは操作上重要な領域に焦点を合わせます。

## 改善時の進め方

1. 一度に 1 コンポーネントに集中する。
2. コンポーネント名とトークン名を直接参照する。
3. 編集後はこの指針の指定コマンド `npx @google/design.md lint DESIGN.md` を使う。
4. 本文の標準を `body-md`、開発者向けコードを `code` にする。
5. 緑を使いすぎず、1 画面内の塗りの緑ボタンを 1 つに抑える。
6. 参照デザインでは白い背景を基本とし、雰囲気づくりの背景を追加しない。
