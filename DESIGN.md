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

# OAPYS Design Guidelines

**English** | [日本語](DESIGN.ja.md)

OAPYS is a security workspace. It is a dense product UI rather than a marketing site. The design gets clarity from a neutral gray scale, 1px borders, and one brand green. Light and dark are both full themes. Neither is a recolor of the other. The OS setting decides the theme by default. A manual choice is applied before first paint and saved in browser storage.

The tokens live in `src/app/globals.css` as CSS custom properties. Each one is written with `light-dark()`, so every component reads one variable and gets the right value for the active theme. The YAML front matter above lists the literal values for each theme.

## Principles

- **Neutral first.** Surfaces, borders, and text use a gray ladder with no tint. Color carries meaning: brand, status, or severity.
- **One green.** The brand green `{colors.brand}` (`#3ecf8e`) marks the primary action, live indicators, and the logo. Allow at most one primary button per viewport.
- **Borders, not shadows.** Separate cards, tables, and panels with a 1px border on a slightly lighter surface. Use shadows only for floating layers: menus, dialogs, and popovers.
- **Compact controls.** Buttons and inputs are 32–34px tall with a 6px radius. They are never pill-shaped.
- **Text and color together.** Status always has a text label. Color alone never carries the meaning.

## Color tokens

### Surfaces

| CSS variable | Role | Light | Dark |
|---|---|---|---|
| `--panel` | Page canvas | `#fcfcfc` | `#171717` |
| `--bg` / `--sidebar` | Alternative background, sidebar | `#f8f8f8` | `#121212` |
| `--surface-100` | Cards, panels, table rows | `#ffffff` | `#1f1f1f` |
| `--surface-200` | Table headers, inputs, inline code | `#f8f8f8` | `#232323` |
| `--surface-300` | Hovered controls, progress tracks | `#f3f3f3` | `#2a2a2a` |
| `--surface-raised` | Selected navigation item | `#f0f0f0` | `#242424` |
| `--surface-hover` | Row and item hover | `#f3f3f3` | `#262626` |

### Borders

| CSS variable | Role | Light | Dark |
|---|---|---|---|
| `--border-muted` | Row dividers inside a card | `#ededed` | `#242424` |
| `--border` | Default card and panel border | `#dfdfdf` | `#2e2e2e` |
| `--border-strong` | Controls: buttons, inputs, selects | `#d4d4d4` | `#393939` |
| `--border-stronger` | Hovered or focused controls | `#c7c7c7` | `#4d4d4d` |

### Foreground

| CSS variable | Role | Light | Dark |
|---|---|---|---|
| `--text` | Default text, headings | `#171717` | `#fafafa` |
| `--text-secondary` | Descriptions, secondary copy | `#525252` | `#b4b4b4` |
| `--muted` | Labels, metadata, inactive navigation | `#707070` | `#898989` |
| `--faint` | Placeholders and decoration only | `#a3a3a3` | `#4d4d4d` |

Never use `--faint` for text that a user must read.

### Brand and primary action

| CSS variable | Role | Light | Dark |
|---|---|---|---|
| `--brand` | Logo, dots, progress fills | `#3ecf8e` | `#3ecf8e` |
| `--green` | Text-safe brand green (links, marks) | `#0f7a4d` | `#3ecf8e` |
| `--accent-fill` | Primary button fill | `#72e3ad` | `#006239` |
| `--accent-fill-hover` | Primary button hover | `#5bd99d` | `#007a4a` |
| `--accent-border` | Primary button border | `#16b674` | `#3ecf8e` at 75% |
| `--on-accent` | Primary button text | `#171717` | `#fafafa` |
| `--ring` | Focus ring | `#16b674` | `#3ecf8e` |

Light mode darkens the green for text so it meets WCAG AA on white. Dark mode keeps the bright green for text, but uses a deep green fill for the primary button so that light text stays readable on it.

### Status

Status tokens come in `-bg`, `-border`, `-text`, and `-fill` sets: `success`, `danger`, `warning`, `caution`, `info`, and `neutral`. Use them only for badges, dots, scores, and small callouts. Never tint a whole panel, the navigation background, or graph nodes with a status color.

| Set | Light text | Dark text | Use |
|---|---|---|---|
| `success` | `#0f7a4d` | `#3ecf8e` | Verified, scanned, connected |
| `danger` | `#c4361c` | `#ff8b70` | Critical severity, errors |
| `warning` | `#9a5b00` | `#f1b44c` | High severity, needs attention |
| `caution` | `#6c6610` | `#d6cf78` | Medium severity |
| `info` | `#1d5fb0` | `#7cb4f0` | Informational notes |
| `neutral` | `#525252` | `#b4b4b4` | Unscanned, low priority |

Do not tint the label of a destructive button red. The confirmation dialog carries the destructive styling.

## Typography

- **Sans:** `Circular, "Helvetica Neue", Helvetica, Arial`, then Japanese fallbacks (`Hiragino Sans`, `Hiragino Kaku Gothic ProN`, `Noto Sans JP`, `Meiryo`). Circular is not bundled, so most environments render Helvetica Neue or Arial. Do not load extra web fonts unless the project decides to license one.
- **Mono:** `"Source Code Pro", "Office Code Pro", Menlo, Monaco, Consolas, ui-monospace`. Use it for resource IDs, code, keyboard hints, and uppercase micro labels.

| Token | Size | Weight | Use |
|---|---|---|---|
| `{typography.heading-page}` | 28px | 400 | Page title (`h1`) |
| `{typography.heading-section}` | 20px | 500 | Section heading |
| `{typography.heading-card}` | 16px | 500 | Card title |
| `{typography.metric}` | 30px | 400 | Summary numbers (tabular figures) |
| `{typography.body}` | 14px | 400 | Default UI text and buttons |
| `{typography.small}` | 13px | 400 | Helper text, metadata |
| `{typography.table-head}` | 12px | 400 | Table column headers |
| `{typography.label-mono}` | 11px | 400 | Uppercase mono labels, badges |
| `{typography.code}` | 13px | 400 | Code and IDs |

Page titles use regular weight with slight negative tracking. Hierarchy comes from size and color, not from bold weight. Avoid 600 and above, except for short emphasis in existing copy.

## Shape, spacing, elevation

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 4px | Badges, inline code, counters |
| `--radius-md` | 6px | Buttons, inputs, navigation items |
| `--radius-lg` | 8px | Cards, panels, tables |
| `--radius-xl` | 12px | Dialogs, large overlays |

- Spacing is based on 4px. Common steps are 8, 12, 16, 24, and 32px.
- Card padding is 22–24px on desktop and 16px on mobile. Leave 32px below the page heading.
- `--shadow-sm`, `--shadow-md`, and `--shadow-lg` exist for floating layers only. Cards stay flat.

## Components

### Buttons

| Variant | Class | Look | Use |
|---|---|---|---|
| Primary | `.primary-button` | `--accent-fill`, `--accent-border`, `--on-accent` | One strong positive action per view (connect, run) |
| Default | `.secondary-button`, `.scan-button`, `.explore-button` | `--surface-100`, `--border-strong`, `--text` | Everyday actions. Prefer this when unsure |
| Text | `.text-button` | No fill, `--text-secondary` | Low-priority or inline actions |
| Icon | `.icon-button` | 32×32, transparent, hover `--surface-hover` | Toolbar actions. Always add `aria-label` |

All buttons are 34px tall (32px for icon buttons), with a 6px radius, 14px text, and weight 400. Hover changes the background or border, never the brightness filter. A disabled button uses 50% opacity and a `not-allowed` cursor.

### Cards and panels

`.metric`, `.graph-panel`, `.ai-workspace`, `.findings-table`, `.connection-card`, and `.xg-panel` share one style: a `--surface-100` background, a 1px `--border`, an 8px radius, and no shadow. Internal headers and toolbars use the same surface with a bottom border.

### Tables

- The header row uses `--surface-200`, 12px `--muted` text, and a bottom border.
- Body rows use `--surface-100` with `--border-muted` dividers. Hover changes the row to `--surface-hover`.
- Show IDs and resource names in mono. Align numbers and scores to the right when they are compared down a column.
- Keep row actions in the last column. Do not mix whole-row navigation with other inline actions.

### Inputs

Search fields, selects, and text areas use `--surface-200` with a 1px `--border-strong` and a 6px radius, at 32–34px tall. Placeholders use `--faint`. Focus shows a 2px `--ring` outline. Never remove the outline without a visible replacement.

### Tabs

Tabs are text only. An inactive tab uses `--muted` text, and hover changes it to `--text`. The active tab uses `--text` with a 2px `--text` underline. Do not color tabs green.

### Badges

Badges are 11px mono text with a 4px radius and 1–2 words. They use one status set (`-bg`, `-border`, `-text`). Use them sparingly, and do not restyle them per call site.

### Navigation

- **Sidebar:** 248px wide on `--sidebar`, with a `--border` right edge. Items are 36px tall with 16px icons (stroke 1.5) and 14px `--muted` text. Hover uses `--surface-hover`. The active item uses `--surface-raised` with `--text`. Group labels are uppercase 11px mono.
- **Top bar:** 48px tall on `--panel`, with a bottom border. It holds the breadcrumbs, the theme select, mode controls, and icon buttons.

### Focus and accessibility

- Every interactive element shows a 2px `--ring` outline on `:focus-visible`.
- Do not put `aria-hidden` on focusable elements. Do not use `pointer-events: none` on disabled controls that can receive focus.
- Body text must meet WCAG AA in both themes. Check new token pairs in both themes before you use them.

## Console layer

A terminal-style layer sits on top of the base system. It adds speed and a security-tool character without lowering readability.

- **Command palette** (`.palette`, `src/components/console-chrome.tsx`): opens with `⌘K` / `Ctrl+K` or the `> Run a command` trigger in the top bar. It lists pages, actions, and theme commands. Filter by typing, move with `↑` `↓`, run with `↵`, and close with `esc`. The input uses mono text and a green `>` prompt.
- **Navigation shortcuts:** press `g` and then `o` (overview), `a` (assets), `r` (risks), `i` (AI investigation), or `s` (settings). Shortcuts are ignored while the user types in a field or while a dialog is open.
- **Status bar** (`.status-bar`): 28px tall, 11px mono, pinned to the bottom of the workspace. It shows DEMO/LIVE, backend state, the latency of the app's own `/api/health`, the finding count, running jobs, and UTC time. The LIVE segment uses the primary fill. Nothing else in the bar uses green except the online dot.
- **Activity log** (`.activity-log`): a terminal panel on the overview page. In live mode it lists diagnosis events and audit entries. In demo mode it replays a scripted scan that is labelled as simulated. Each line has a time, level (`INFO`, `RUN`, `OK`, `WARN`, `ERROR`), a `[tag]`, and text. Warnings and errors color the whole line.
- **Terminal surface:** the activity log stays dark in both themes (`--term-bg`), like a code block. Its colors are `--term-text`, `--term-muted`, `--term-green`, `--term-amber`, `--term-red`, and `--term-blue`. Do not use terminal colors outside terminal surfaces.
- **Prompt marks:** page titles start with a mono green `>`, and breadcrumbs start with `~/`. Use `$` with a blinking block cursor only at the end of a terminal surface.
- **Graph motion:** attack-path edges show a dash that flows toward the target, and critical nodes pulse slowly. In dark mode, critical paths and the selected node get a soft glow (`--glow`). Light mode has no glow.
- **Motion rules:** every animation in this layer stops under `prefers-reduced-motion: reduce`. Entry effects must not depend on opacity, so content is still readable if an animation does not run.

## Theme switching

- `src/lib/theme.ts` sets `data-theme` on `<html>` before first paint. The values are `system`, `light`, and `dark`.
- `:root[data-theme="light"]` and `:root[data-theme="dark"]` set `color-scheme`. `light-dark()` then resolves every token. In `system` mode the result follows `prefers-color-scheme`.
- New colors must be added as tokens with both values. Do not hard-code a hex value in a component rule.

## Responsive behavior

| Width | Change |
|---|---|
| ≥ 1600px | Content max width 1760px |
| ≤ 1250px | Summary cards in two columns. Graph details move below the canvas |
| ≤ 1050px | The AI investigation input and results stack |
| ≤ 800px | The sidebar collapses. Page padding drops to 16–20px |
| ≤ 520px | Single-column cards. The page title is 24px |

Keep touch targets at least 32px. Let long Japanese labels wrap instead of truncating them.

## Do's and don'ts

### Do
- Build hierarchy with surface steps (canvas, surface-100, surface-200) and 1px borders.
- Keep the primary button rare, and use the default button for everything else.
- Pair every status color with text.
- Use mono type for IDs, code, and micro labels.

### Don't
- Don't tint gray surfaces green or blue.
- Don't use white text on the light-mode green fill.
- Don't add drop shadows to cards, or gradients to page backgrounds. The only glow is `--glow` on dark-mode graph paths, the selected node, and the palette.
- Don't use pill-shaped buttons.
- Don't hard-code colors outside the token block.

## Iteration guide

1. Change one component at a time, and refer to it by its class and token names.
2. Check every change in light mode and in dark mode.
3. Run `npm run lint`, `npm run typecheck`, and `npm run build` after CSS or component changes.
4. Run `npx @google/design.md lint DESIGN.md` after you edit this file.
