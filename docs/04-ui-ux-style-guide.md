# Horode Proof: UI/UX Design Style Guide

**Version:** 1.1 (Notion-style direction, minimal icons)
**Reference:** Dark-mode Notion home screen shared by Tega.
**Note on brand:** Colors and type below are a proposed system. If Horode Design Studio has fixed brand tokens, swap the accent and neutrals into the token tables and everything else follows.

---

## 1. Design Direction

Horode Proof should feel like a quiet, document-like workspace, not a dashboard. Think Notion: text first, soft surfaces, generous space, and almost no decoration.

What we are borrowing from the reference screen:

- Near-black canvas with a slightly lighter sidebar, and soft rounded cards one step lighter than the canvas
- A collapsible left sidebar with a search field at the top, a shortcut hint (Ctrl+K), short nav items, and a Recents list
- A large, bold, centered greeting at the top of the home page
- Small, muted section labels ("Recently visited", "Recents") instead of heavy headings
- Cards with a cover strip, a bold title, and a quiet meta line (who, when)
- Blue text links for secondary actions
- Hover states that are a gentle background tint, not borders or shadows
- Lists that read like pages, not like tables of widgets

## 2. Icon Policy (Hard Rule)

**Default is no icon. Text does the job.** An icon is allowed only if removing it would make the interface harder to use and no word can replace it.

**Allowed glyphs (the complete list):**

| Glyph | Where | Why it is allowed |
|---|---|---|
| Sidebar toggle | Top of sidebar | Universal pattern, no good word replacement |
| Chevron | Expandable sidebar rows, dropdowns | Signals expand or open |
| Ellipsis (three dots) | Page and card overflow menus | Standard for "more" |
| Close (x) | Dialogs, toasts, sheets | Standard for dismiss |

Everything above is drawn as a small inline SVG. **No icon library is installed.**

**Never use icons for:**
- Navigation items (Home, New check, Clients are plain words)
- Buttons (labels only: "Check slides", "Accept fix")
- Issue types (use colored text tags)
- Statuses (use words: Open, Accepted, Ignored)
- Empty states (no illustrations, a sentence and a button)
- Decoration of any kind

**Allowed non-icon identity elements:** the Horode logo mark once, at the top of the sidebar as the workspace identity (like the logo in the reference). Client initials in a plain circle are allowed in the client switcher.

**Slide markers** are numbered circles. The number is content, not an icon.

## 3. Principles

1. **Quiet by default.** Color appears only when it means something (an issue, a selection, a link).
2. **The work is the hero.** The slide image is the largest thing on any results screen.
3. **Show, then explain.** Point at the spot, name the problem, offer the fix.
4. **Honest about uncertainty.** Low confidence and unreadable text are real, labeled states.
5. **Fast by default.** Every common action is one click or one key.
6. **Words over symbols.** Because there are almost no icons, every label must be clear and short.

## 4. Voice and Tone (Copywriting Guide)

**Voice:** a sharp, friendly colleague who reads over your shoulder. Short sentences. Plain words. Never scolding.

| Do | Don't |
|---|---|
| "Slide 4: 'recieve' should be 'receive'." | "Error detected: orthographic anomaly." |
| "Couldn't read this clearly. Worth a quick look." | "OCR confidence below threshold." |
| "Nothing to fix. This carousel is clean." | "No issues found!!!" |

**Rules**
- Lead with the finding or the action.
- Use the designer's words: slide, carousel, export, client.
- No exclamation marks except for rare, genuine success.
- No blame. Say "Possible typo", never "You made a mistake".
- Plain punctuation. Avoid long dashes. Use periods and commas.
- Every empty state says what to do next.

**Key strings**

| Moment | Copy |
|---|---|
| Home greeting | "Good morning, Tega" (changes with time of day) |
| Search field | "Search" with the hint "Ctrl+K" |
| Upload prompt | "Drop your slides here, or click to choose files" |
| Upload hint | "PNG, JPEG, or PDF. Up to 30 slides." |
| Analyzing | "Reading slide 3 of 10" |
| Results header | "7 issues across 10 slides" |
| Clean result | "Nothing to fix. This carousel is clean." |
| Unreadable | "Couldn't read this clearly. Worth a quick look." |
| Accept | "Accept fix" |
| Ignore | "Ignore" |
| Never flag | "Never flag this for [Client]" |
| Copy list | "Copy corrections" |
| Failed slide | "This slide didn't finish. Try again." |
| Delete check | "Delete this check now" |
| Home, nothing yet | "Nothing here yet. Start with a new check." |

## 5. Design Tokens

### 5.1 Color: dark mode (default)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#191919` | Main canvas |
| `sidebar` | `#202020` | Sidebar background |
| `surface` | `#252525` | Cards, panels, inputs |
| `surface-hover` | `#2C2C2C` | Row and card hover |
| `border` | `#2F2F2F` | Dividers, only where needed |
| `text` | `#EBEBEB` | Primary text |
| `text-muted` | `#9B9B9B` | Section labels, meta lines |
| `text-faint` | `#6F6F6F` | Hints, placeholders |
| `accent` | `#2383E2` | Primary button, focus ring, selected marker |
| `link` | `#529CCA` | Text links |
| `accent-soft` | `#1F3347` | Selected row or card background |

### 5.2 Color: light mode

| Token | Hex |
|---|---|
| `bg` | `#FFFFFF` |
| `sidebar` | `#F7F7F5` |
| `surface` | `#F1F1EF` |
| `surface-hover` | `#E9E9E6` |
| `border` | `#E6E6E3` |
| `text` | `#37352F` |
| `text-muted` | `#787774` |
| `accent` | `#2383E2` |
| `link` | `#0B6E99` |
| `accent-soft` | `#E7F3FB` |

Follow the system setting by default, with a manual override in Settings. Dark is the design-first mode.

### 5.3 Issue tags

Issue types are shown as **small text tags** with a soft tinted background. No icons. Color supports the label, never replaces it.

| Group | Tag label | Text (dark) | Background (dark) |
|---|---|---|---|
| Spelling and typo | Spelling, Repeated word | `#FF8A80` | `#3D2224` |
| Grammar and punctuation | Grammar, Punctuation | `#FFB86B` | `#3A2C1A` |
| Consistency | Consistency, Duplicate | `#B8A4FF` | `#2D2644` |
| Leftover and cut-off | Placeholder, Cut off | `#5FD3C4` | `#183633` |
| Style (Strict only) | Style | `#A8A8A8` | `#2C2C2C` |
| Unreadable | Unreadable | `#E8A24A` | transparent with dashed outline |

Light mode uses the same hues with darker text on pale tints, each pair checked for AA contrast.

**Status colors:** success `#4DAB9A`, warning `#CB912F`, danger `#E5675B`. Used sparingly, always with words.

### 5.4 Typography

| Role | Font | Weight | Size / Line |
|---|---|---|---|
| Greeting | Inter | 700 | 40 / 48 |
| Page title | Inter | 700 | 32 / 40 |
| Heading | Inter | 600 | 20 / 28 |
| Body | Inter | 400 | 14 / 22 |
| Section label | Inter | 500 | 13 / 18, muted color |
| Small and meta | Inter | 400 | 12 / 18, muted color |
| Text diff | JetBrains Mono | 400 | 13 / 20 |

Sentence case everywhere. Original and suggested text use the mono face so single-character differences are easy to see.

### 5.5 Spacing, Radius, Layout

- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64.
- **Radius:** 6 (inputs, tags, buttons), 12 (cards, panels), 16 (dropzone).
- **Elevation:** none on cards. Only menus, the command palette, and dialogs get a soft shadow.
- **Sidebar width:** 260px, collapsible to hidden.
- **Content width:** centered, max 1120px on Home and lists, full width on Results.
- **Borders:** avoid. Use background steps and space to separate things.

### 5.6 Motion

- 120ms for hover and focus, 200ms for panels and menus.
- New results fade in with an 8px upward slide.
- Selected marker pulses once.
- Honor reduced motion by switching to instant changes.

## 6. App Shell

```
+----------------+-----------------------------------------------+
| [toggle]       |                                         [...] |
| Search  Ctrl+K |                                               |
|                |            Good morning, Tega                 |
| Home           |                                               |
| New check      |   Recently checked                            |
|                |   [card] [card] [card] [card]                 |
| Clients        |                                               |
|  v Client A    |   Needs attention                             |
|     Check 1    |   Check name      Client     5 open issues    |
|     Check 2    |   Check name      Client     2 open issues    |
|  > Client B    |                                               |
|                |                                               |
| Recents        |                                               |
|  Check name    |                                               |
|  Check name    |                                               |
|                |                                               |
| Tega  v        |                                               |
+----------------+-----------------------------------------------+
```

**Sidebar anatomy (top to bottom)**
1. Sidebar toggle (left) and workspace logo mark
2. Search field with "Ctrl+K" hint
3. Home, New check (plain text rows)
4. Clients section: label, then client rows that expand with a chevron to show their checks
5. Recents section: last viewed checks
6. Bottom: user name with a chevron menu containing Settings and theme

Rows are text only, with a gentle hover tint and an accent-soft selected state. Long names truncate with an ellipsis, as in the reference.

## 7. Components

### 7.1 Search and command palette (Ctrl+K)
- Opens a centered panel, text input, grouped results: Checks, Clients, Actions ("New check", "Add client").
- Arrow keys to move, Enter to open, Esc to close.
- No icons beside results. Group labels in muted small text.

### 7.2 Section label
Small muted text above a group ("Recently checked", "Needs attention", "Recents"). No dividers, no icons.

### 7.3 Card (Recently checked)
- Surface background, 12px radius, no border.
- Top strip shows a cropped preview of the first slide (the "cover").
- Below: bold check name (two lines max), then a muted meta line: client and relative time.
- Hover: surface-hover.

### 7.4 List row
Used for checks, clients, dictionary terms, and ignore rules. Plain text columns: name, client, date, open issues. Hover tint, click opens. Reads like a Notion database in list view.

### 7.5 Buttons

| Type | Look | Use |
|---|---|---|
| Primary | Solid accent, white text | One per screen: Check slides, Copy corrections |
| Secondary | Surface fill, text color | Accept fix, Add term |
| Ghost | No fill, hover tint | Ignore, Cancel |
| Link | Link-colored text | Quiet actions like "Try again" |
| Destructive | Danger text, confirm dialog | Delete check, remove client |

Text labels only. 36px tall (44px on touch). Focus ring is 2px accent with 2px offset.

### 7.6 Strictness control
A three-part segmented control with plain words: Relaxed, Standard, Strict. A one-line muted description sits under it and updates on change. Standard is the default.

### 7.7 Dropzone
Large, centered, 16px radius, surface fill with a dashed outline that turns accent on drag-over. Text only: "Drop your slides here, or click to choose files", with the hint line underneath. After files are added, thumbnails sit in a horizontal strip with drag-to-reorder and a plain "Remove" link on hover.

### 7.8 Slide viewer
- The largest element on Results.
- Numbered circle markers on flagged spots, tinted by issue group, with a white ring so they read on any background.
- Selected marker grows and the text gets a soft highlight box.
- Unreadable regions use a dashed outline.
- Thumbnail strip beneath, each with a small count in plain text ("2").
- Previous and next slide by keyboard, and by text buttons "Previous" and "Next".

### 7.9 Issue card

```
Spelling    High confidence
Slide 4
recieve   ->   receive
Misspelling of "receive".
[Accept fix]  [Ignore]   ...
```

- Type shown as a text tag.
- Original text in mono with a soft red tint, suggestion in mono with a soft green tint.
- Overflow menu (ellipsis) holds "Never flag this for [Client]".
- Selected card uses accent-soft background.
- Resolved cards shrink to one quiet line with an "Undo" link.

### 7.10 Confidence label
High confidence shows as plain muted text. Medium shows "Worth checking" in warning color. Low shows "Not sure" with a dashed tag outline.

### 7.11 Toasts and dialogs
Small, bottom-left toasts with plain text and an "Undo" link when relevant. Dialogs name exactly what will happen and make Cancel the default focus. Close (x) is the only icon.

## 8. Key Screens

**Home.** Big greeting. "Recently checked" as a row of cards. "Needs attention" as a list of checks with unresolved issues. Nothing else. First-time state: "Nothing here yet. Start with a new check." plus a primary button.

**New check.** A page, not a modal. Title field (defaults to client and date), client selector, dropzone, thumbnail strip, strictness control, one primary button.

**Results.** Three zones on desktop: slide viewer (about 60 percent), issue list (about 40 percent), thumbnail strip along the bottom. Summary line at the top: "7 issues across 10 slides" with type tags as filters, and a "5 of 7 resolved" progress line. On tablet, the issue list becomes a bottom sheet. On mobile, the viewer is full width with a swipe-up list.

**Clients.** A simple list. Each row: name, number of checks, last check date.

**Client page.** Reads like a Notion page: large client name, then plain text tabs (Overview, Dictionary, Ignore list, History, Settings). Dictionary and Ignore list are editable lists with inline add.

**Settings.** Appearance (System, Light, Dark), shortcuts reference, retention default, data and privacy summary.

## 9. States

| State | Treatment |
|---|---|
| Empty | One sentence and one button, no illustration |
| Uploading | Per-file progress as a thin bar under each thumbnail name |
| Analyzing | Per-slide status in words on thumbnails: Waiting, Reading, Done |
| Partial | Finished slides are usable immediately, pending ones show a quiet shimmer |
| Failed slide | "This slide didn't finish. Try again." with a link-style retry |
| Clean | "Nothing to fix. This carousel is clean." |
| Error | Plain sentence and a retry link, never raw error text |
| Destructive confirm | States exactly what will be deleted, Cancel is the default |

## 10. Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl+K` | Open search and commands |
| `J` or `Down` | Next issue |
| `K` or `Up` | Previous issue |
| `A` | Accept fix |
| `I` | Ignore |
| `N` | Never flag for this client |
| `Left` / `Right` | Previous / next slide |
| `C` | Copy corrections |
| `?` | Show shortcuts |

## 11. Accessibility

- WCAG 2.1 AA contrast in both themes.
- Meaning never depends on color or on an icon. Every state has a text label, which the no-icon policy makes natural.
- Full keyboard navigation with a visible focus ring.
- Markers are focusable and announce "Issue 3, spelling, slide 4".
- A live region announces results as slides finish.
- Respect reduced motion and system theme.
- Touch targets at least 44px on touch devices.

## 12. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| 1280px and up | Full layout, sidebar open, three-zone Results |
| 768 to 1279px | Sidebar collapsed by default, issue list in a side or bottom panel |
| Below 768px | Sidebar becomes a slide-over menu, single column, issue list as a swipe-up sheet |

## 13. Do and Don't

**Do**
- Let space and background steps do the separating.
- Keep one primary action per screen.
- Put the slide image first on every results view.
- Treat unreadable text as an honest result.

**Don't**
- Add an icon "to make it friendlier". Write a better label instead.
- Use borders where a background step works.
- Use red for anything other than real errors.
- Hide the suggested fix behind a click.
- Write error messages that blame the user.
