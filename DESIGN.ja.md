---
version: alpha
name: OAPYS-design
description: Product UI design system for OAPYS. Neutral gray surfaces, fine 1px borders, a single brand green, compact 6px-radius controls, and first-class light and dark themes driven by shared semantic tokens.

colors:
  brand: "#3ecf8e"
  # Light theme
  light-canvas: "#fcfcfc"
  light-alternative: "#f8f8f8"
  light-surface-100: "#ffffff"
  light-surface-200: "#f8f8f8"
  light-surface-300: "#f3f3f3"
  light-selection: "#f0f0f0"
  light-border-muted: "#ededed"
  light-border: "#dfdfdf"
  light-border-strong: "#d4d4d4"
  light-border-stronger: "#c7c7c7"
  light-foreground: "#171717"
  light-foreground-light: "#525252"
  light-foreground-lighter: "#707070"
  light-foreground-muted: "#a3a3a3"
  light-brand-text: "#0f7a4d"
  light-primary-fill: "#72e3ad"
  light-primary-fill-hover: "#5bd99d"
  light-primary-border: "#16b674"
  light-on-primary: "#171717"
  light-destructive: "#c4361c"
  light-warning: "#9a5b00"
  light-info: "#1d5fb0"
  # Dark theme
  dark-canvas: "#171717"
  dark-alternative: "#121212"
  dark-surface-100: "#1f1f1f"
  dark-surface-200: "#232323"
  dark-surface-300: "#2a2a2a"
  dark-selection: "#242424"
  dark-border-muted: "#242424"
  dark-border: "#2e2e2e"
  dark-border-strong: "#393939"
  dark-border-stronger: "#4d4d4d"
  dark-foreground: "#fafafa"
  dark-foreground-light: "#b4b4b4"
  dark-foreground-lighter: "#898989"
  dark-foreground-muted: "#4d4d4d"
  dark-brand-text: "#3ecf8e"
  dark-primary-fill: "#006239"
  dark-primary-fill-hover: "#007a4a"
  dark-primary-border: "#3ecf8ebf"
  dark-on-primary: "#fafafa"
  dark-destructive: "#ff8b70"
  dark-warning: "#f1b44c"
  dark-info: "#7cb4f0"

typography:
  heading-page:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans', 'Noto Sans JP', sans-serif"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: -0.02em
  heading-section:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans', 'Noto Sans JP', sans-serif"
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.01em
  heading-card:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans', 'Noto Sans JP', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  metric:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.02em
  body:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans', 'Noto Sans JP', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  small:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans', 'Noto Sans JP', sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  table-head:
    fontFamily: "Circular, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans', 'Noto Sans JP', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  label-mono:
    fontFamily: "'Source Code Pro', 'Office Code Pro', Menlo, monospace"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.08em
  code:
    fontFamily: "'Source Code Pro', 'Office Code Pro', Menlo, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px

components:
  button-primary:
    backgroundColor: "{colors.light-primary-fill}"
    textColor: "{colors.light-on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 7px 14px
  button-default:
    backgroundColor: "{colors.light-surface-100}"
    textColor: "{colors.light-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 7px 14px
  button-text:
    backgroundColor: "{colors.light-canvas}"
    textColor: "{colors.light-foreground-light}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 4px 8px
  input:
    backgroundColor: "{colors.light-surface-200}"
    textColor: "{colors.light-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 6px 10px
  card:
    backgroundColor: "{colors.light-surface-100}"
    textColor: "{colors.light-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 22px
  table-header:
    backgroundColor: "{colors.light-surface-200}"
    textColor: "{colors.light-foreground-lighter}"
    typography: "{typography.table-head}"
    rounded: "{rounded.sm}"
    padding: 12px 19px
  badge:
    backgroundColor: "{colors.light-surface-300}"
    textColor: "{colors.light-foreground-light}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.sm}"
    padding: 1px 6px
  sidebar:
    backgroundColor: "{colors.light-alternative}"
    textColor: "{colors.light-foreground-lighter}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 10px
  topbar:
    backgroundColor: "{colors.light-canvas}"
    textColor: "{colors.light-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 0px 24px
---

# OAPYS デザインガイドライン

[English](DESIGN.md) | **日本語**

OAPYS はセキュリティワークスペースです。マーケティングサイトではなく、情報量の多いプロダクト UI です。明快さは、色味のないグレー階調、1px の境界線、ブランドグリーン 1 色で作ります。ライトとダークはどちらも正式なテーマで、片方をもう片方の色替えとして扱いません。初期値は OS の設定に従います。手動で選んだテーマは初回描画前に適用し、ブラウザーストレージに保存します。

トークンは `src/app/globals.css` の CSS カスタムプロパティです。各トークンは `light-dark()` で定義しているので、コンポーネントは同じ変数を参照するだけで、選択中のテーマに合った値を得られます。テーマごとの実際の値は、上の YAML フロントマターにあります。

## 原則

- **ニュートラル優先。** 面・境界線・文字には色味のないグレー階調を使います。色はブランド、状態、重要度という意味を持つ場合だけ使います。
- **緑は 1 色。** ブランドグリーン `{colors.brand}`（`#3ecf8e`）は、主要操作、ライブ表示、ロゴに使います。主要ボタンは 1 画面に 1 つまでにします。
- **影ではなく境界線。** カード、表、パネルは、少し明るい面と 1px の境界線で区切ります。影はメニュー、ダイアログ、ポップオーバーなどの浮いた要素だけに使います。
- **コンパクトな操作部品。** ボタンと入力欄は高さ 32〜34px、角丸 6px にします。ピル形にはしません。
- **文字と色を併用。** 状態には必ず文字ラベルを付けます。色だけで意味を伝えません。

## 色トークン

### 面

| CSS 変数 | 役割 | ライト | ダーク |
|---|---|---|---|
| `--panel` | ページの背景 | `#fcfcfc` | `#171717` |
| `--bg` / `--sidebar` | 代替背景、サイドバー | `#f8f8f8` | `#121212` |
| `--surface-100` | カード、パネル、表の行 | `#ffffff` | `#1f1f1f` |
| `--surface-200` | 表ヘッダー、入力欄、インラインコード | `#f8f8f8` | `#232323` |
| `--surface-300` | ホバー中の部品、進捗バーの下地 | `#f3f3f3` | `#2a2a2a` |
| `--surface-raised` | 選択中のナビゲーション項目 | `#f0f0f0` | `#242424` |
| `--surface-hover` | 行・項目のホバー | `#f3f3f3` | `#262626` |

### 境界線

| CSS 変数 | 役割 | ライト | ダーク |
|---|---|---|---|
| `--border-muted` | カード内の行区切り | `#ededed` | `#242424` |
| `--border` | カード・パネルの標準の境界線 | `#dfdfdf` | `#2e2e2e` |
| `--border-strong` | ボタン、入力欄、セレクト | `#d4d4d4` | `#393939` |
| `--border-stronger` | ホバー中・フォーカス中の部品 | `#c7c7c7` | `#4d4d4d` |

### 文字

| CSS 変数 | 役割 | ライト | ダーク |
|---|---|---|---|
| `--text` | 標準の文字、見出し | `#171717` | `#fafafa` |
| `--text-secondary` | 説明文、補足 | `#525252` | `#b4b4b4` |
| `--muted` | ラベル、メタ情報、非選択のナビゲーション | `#707070` | `#898989` |
| `--faint` | プレースホルダーと装飾のみ | `#a3a3a3` | `#4d4d4d` |

ユーザーが読む必要のある文字に `--faint` を使ってはいけません。

### ブランドと主要操作

| CSS 変数 | 役割 | ライト | ダーク |
|---|---|---|---|
| `--brand` | ロゴ、ドット、進捗バー | `#3ecf8e` | `#3ecf8e` |
| `--green` | 文字に使えるブランドグリーン（リンク、マーク） | `#0f7a4d` | `#3ecf8e` |
| `--accent-fill` | 主要ボタンの塗り | `#72e3ad` | `#006239` |
| `--accent-fill-hover` | 主要ボタンのホバー | `#5bd99d` | `#007a4a` |
| `--accent-border` | 主要ボタンの境界線 | `#16b674` | `#3ecf8e`（不透明度 75%） |
| `--on-accent` | 主要ボタンの文字 | `#171717` | `#fafafa` |
| `--ring` | フォーカスリング | `#16b674` | `#3ecf8e` |

ライトでは、白地で WCAG AA を満たすよう、文字用の緑を暗くします。ダークでは文字に明るい緑を使い、主要ボタンには明るい文字が読める深い緑の塗りを使います。

### 状態

状態トークンは `-bg`、`-border`、`-text`、`-fill` の組で、`success`、`danger`、`warning`、`caution`、`info`、`neutral` があります。使うのはバッジ、ドット、スコア、小さな注記だけです。パネル全体、ナビゲーションの背景、グラフのノードを状態色で塗ってはいけません。

| 組 | ライトの文字 | ダークの文字 | 用途 |
|---|---|---|---|
| `success` | `#0f7a4d` | `#3ecf8e` | 確認済み、診断済み、接続済み |
| `danger` | `#c4361c` | `#ff8b70` | Critical、エラー |
| `warning` | `#9a5b00` | `#f1b44c` | High、要対応 |
| `caution` | `#6c6610` | `#d6cf78` | Medium |
| `info` | `#1d5fb0` | `#7cb4f0` | 情報 |
| `neutral` | `#525252` | `#b4b4b4` | 未診断、低優先度 |

破壊的な操作のボタンでも、ラベルを赤くしません。破壊的な操作であることは確認ダイアログで示します。

## タイポグラフィ

- **サンセリフ：** `Circular, "Helvetica Neue", Helvetica, Arial` のあとに日本語フォールバック（`Hiragino Sans`、`Hiragino Kaku Gothic ProN`、`Noto Sans JP`、`Meiryo`）を続けます。Circular は同梱していないので、多くの環境では Helvetica Neue か Arial で表示されます。プロジェクトとしてライセンスを決めない限り、Web フォントを追加で読み込みません。
- **等幅：** `"Source Code Pro", "Office Code Pro", Menlo, Monaco, Consolas, ui-monospace`。リソース ID、コード、キーボードヒント、大文字の小さなラベルに使います。

| トークン | サイズ | ウェイト | 用途 |
|---|---|---|---|
| `{typography.heading-page}` | 28px | 400 | ページ見出し（`h1`） |
| `{typography.heading-section}` | 20px | 500 | セクション見出し |
| `{typography.heading-card}` | 16px | 500 | カード見出し |
| `{typography.metric}` | 30px | 400 | サマリーの数値（等幅数字） |
| `{typography.body}` | 14px | 400 | 標準の UI 文字、ボタン |
| `{typography.small}` | 13px | 400 | 補足、メタ情報 |
| `{typography.table-head}` | 12px | 400 | 表の列見出し |
| `{typography.label-mono}` | 11px | 400 | 大文字の等幅ラベル、バッジ |
| `{typography.code}` | 13px | 400 | コード、ID |

ページ見出しは標準ウェイトで、字間をわずかに詰めます。階層は太さではなく、サイズと色で表します。既存の文言で短く強調する場合を除き、600 以上のウェイトは避けます。

## 形・余白・奥行き

| トークン | 値 | 用途 |
|---|---|---|
| `--radius-sm` | 4px | バッジ、インラインコード、件数表示 |
| `--radius-md` | 6px | ボタン、入力欄、ナビゲーション項目 |
| `--radius-lg` | 8px | カード、パネル、表 |
| `--radius-xl` | 12px | ダイアログ、大きなオーバーレイ |

- 余白は 4px を基準にします。よく使う値は 8、12、16、24、32px です。
- カードの内側の余白は、デスクトップで 22〜24px、モバイルで 16px です。ページ見出しの下は 32px 空けます。
- `--shadow-sm`、`--shadow-md`、`--shadow-lg` は浮いた要素専用です。カードは平面のままにします。

## コンポーネント

### ボタン

| 種類 | クラス | 見た目 | 用途 |
|---|---|---|---|
| 主要 | `.primary-button` | `--accent-fill`、`--accent-border`、`--on-accent` | 1 画面に 1 つの、強い肯定的な操作（接続、実行） |
| 標準 | `.secondary-button`、`.scan-button`、`.explore-button` | `--surface-100`、`--border-strong`、`--text` | 普段の操作。迷ったらこれを使う |
| テキスト | `.text-button` | 塗りなし、`--text-secondary` | 優先度の低い操作、文中の操作 |
| アイコン | `.icon-button` | 32×32、透明、ホバーで `--surface-hover` | ツールバーの操作。必ず `aria-label` を付ける |

ボタンはすべて高さ 34px（アイコンボタンは 32px）、角丸 6px、文字 14px、ウェイト 400 です。ホバーでは背景か境界線を変え、明るさフィルターは使いません。無効状態は不透明度 50%、カーソルは `not-allowed` にします。

### カードとパネル

`.metric`、`.graph-panel`、`.ai-workspace`、`.findings-table`、`.connection-card`、`.xg-panel` は同じスタイルを共有します。背景は `--surface-100`、境界線は 1px の `--border`、角丸は 8px、影はなしです。内部のヘッダーとツールバーは同じ面に下線を引きます。

### 表

- ヘッダー行は `--surface-200`、12px の `--muted` 文字、下線にします。
- 本文の行は `--surface-100` で、`--border-muted` で区切ります。ホバーで `--surface-hover` に変えます。
- ID とリソース名は等幅で表示します。列で比べる数値とスコアは右揃えにします。
- 行の操作は最後の列にまとめます。行全体の遷移と、行内の別の操作を混在させません。

### 入力欄

検索欄、セレクト、テキストエリアは `--surface-200` に 1px の `--border-strong`、角丸 6px、高さ 32〜34px です。プレースホルダーは `--faint` です。フォーカス時は 2px の `--ring` のアウトラインを表示します。代わりの見た目なしにアウトラインを消してはいけません。

### タブ

タブは文字だけで表します。非選択のタブは `--muted` で、ホバーで `--text` に変えます。選択中のタブは `--text` に 2px の `--text` の下線です。タブを緑にしません。

### バッジ

バッジは 11px の等幅文字、角丸 4px、1〜2 語です。状態の組（`-bg`、`-border`、`-text`）を 1 つ使います。多用せず、呼び出し側でスタイルを変えません。

### ナビゲーション

- **サイドバー：** 幅 248px、背景は `--sidebar`、右端に `--border` の線を引きます。項目は高さ 36px、アイコンは 16px（線幅 1.5）、文字は 14px の `--muted` です。ホバーは `--surface-hover`、選択中は `--surface-raised` に `--text` です。グループ名は大文字 11px の等幅にします。
- **トップバー：** 高さ 48px、背景は `--panel`、下に境界線を引きます。パンくず、テーマ選択、モード切替、アイコンボタンを置きます。

### フォーカスとアクセシビリティ

- 操作できる要素はすべて、`:focus-visible` で 2px の `--ring` のアウトラインを表示します。
- フォーカスできる要素に `aria-hidden` を付けません。フォーカスを受ける無効状態の部品に `pointer-events: none` を使いません。
- 本文の文字は、両方のテーマで WCAG AA を満たす必要があります。新しいトークンの組み合わせは、使う前に両方のテーマで確認します。

## テーマの切り替え

- `src/lib/theme.ts` が初回描画前に `<html>` の `data-theme` を設定します。値は `system`、`light`、`dark` です。
- `:root[data-theme="light"]` と `:root[data-theme="dark"]` が `color-scheme` を設定し、`light-dark()` がすべてのトークンを解決します。`system` では `prefers-color-scheme` に従います。
- 新しい色は、両テーマの値を持つトークンとして追加します。コンポーネントのルールに hex 値を直接書きません。

## レスポンシブ対応

| 幅 | 変更 |
|---|---|
| 1600px 以上 | コンテンツの最大幅 1760px |
| 1250px 以下 | サマリーカードを 2 列にし、グラフの詳細をキャンバスの下へ移す |
| 1050px 以下 | AI 調査の入力と結果を縦に並べる |
| 800px 以下 | サイドバーを折りたたみ、ページの余白を 16〜20px にする |
| 520px 以下 | カードを 1 列にし、ページ見出しを 24px にする |

タッチ領域は 32px 以上を保ちます。長い日本語ラベルは省略せず、折り返します。

## 推奨事項と避けること

### 推奨
- 面の段差（canvas → surface-100 → surface-200）と 1px の境界線で階層を作る。
- 主要ボタンは控えめに使い、それ以外には標準ボタンを使う。
- 状態色には必ず文字を添える。
- ID、コード、小さなラベルには等幅を使う。

### 避けること
- グレーの面を緑や青に色付けしない。
- ライトの緑の塗りに白い文字を載せない。
- カードに影を付けたり、ページ背景にグラデーションを使ったりしない。
- ピル形のボタンを使わない。
- トークン定義の外に色を直接書かない。

## 改善時の進め方

1. 1 回の変更は 1 つのコンポーネントに絞り、クラス名とトークン名で指して伝える。
2. 変更はライトとダークの両方で確認する。
3. CSS やコンポーネントを変更したら、`npm run lint`、`npm run typecheck`、`npm run build` を実行する。
4. このファイルを編集したら、`npx @google/design.md lint DESIGN.md` を実行する。
