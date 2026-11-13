# Horode Proof: Project Requirements Document (PRD)

**Working name:** Horode Proof
**Owner:** Tega, Horode Design Studio
**Version:** 1.0 (MVP definition)
**Status:** Draft for build

---

## 1. Overview

Horode Proof is a web tool that reads exported social media designs (carousels, single posts, stories) and flags typos, grammar errors, inconsistencies, and leftover text, then suggests the fix for each. It exists so a designer never has to sit down and proofread every slide by hand before sending work to a client.

It is built for Horode Design Studio first. The structure leaves room to open it to other designers later.

## 2. Problem Statement

Clients regularly point out mistakes in delivered social media designs. Most are:

1. Typos and spelling errors
2. Grammar and punctuation slips
3. Inconsistencies across slides (brand name spelling, capitalization, date formats)
4. Text that should not be there (placeholder copy, duplicated lines, cut-off text)
5. Hierarchy and structure problems (later phase)

The designer is busy, works alone, and is too close to the work to catch their own mistakes. Manual proofreading of many carousels does not fit into the schedule, so mistakes reach the client.

## 3. Goals

- Reduce client-reported text mistakes to near zero.
- Cut review time per carousel to under 2 minutes, including fixing.
- Keep false alarms low enough that the tool is trusted and actually used.
- Work with the designer's real workflow: Figma and Affinity Designer exports as PNG, JPEG, and PDF.

## 4. Non-Goals (MVP)

- Editing or exporting corrected designs. The tool tells you what to fix, you fix it in your design app.
- Hierarchy, layout, or visual design critique.
- Figma or Google Drive link import.
- User accounts, billing, teams, or public sharing.
- Languages other than English (Nigerian, British, and American English variants only).

## 5. Users

**Primary:** Tega, brand designer and founder of Horode Design Studio. Designs in Figma and Affinity Designer, exports PNG and JPEG most often, PDF sometimes. Busy, reviews between other tasks.

**Future:** Other freelance and agency designers with the same problem.

## 6. User Stories

- As a designer, I drop in my exported slides and get a list of text issues without reading every slide.
- As a designer, I see exactly where on the slide each issue sits.
- As a designer, I get a suggested correction for each issue so I can fix it quickly.
- As a designer, I can choose how strict the check is depending on the style of the design.
- As a designer, I can tell the tool that a flagged word is intentional so it stops flagging it for that client.
- As a designer, I can save a client's brand terms (names, products, handles) so they are never flagged.
- As a designer, I can copy a clean list of all corrections at once.
- As a designer, I can see when the tool could not read something clearly instead of getting a wrong guess.

## 7. Scope: MVP Features

### 7.1 Upload
- Drag and drop multiple PNG, JPEG, and PDF files at once.
- Multi-page PDFs are split into one image per page.
- Paste an image from the clipboard for a single-slide check.
- Slides are ordered by filename (natural sort) with drag to reorder.
- Mixed formats in one batch are supported.

### 7.2 Analysis
- Each slide is read and checked by a vision-capable AI model.
- Results are returned as structured data: issue type, original text, suggested fix, location, confidence.
- Cross-slide consistency check runs after per-slide analysis (brand name spelling, capitalization style, number and date formats, repeated or duplicated lines).

### 7.3 Strictness Toggle

| Level | What it flags |
|---|---|
| Relaxed | Clear spelling mistakes, repeated words, placeholder text (Lorem ipsum, "Text here"), cut-off text |
| Standard (default) | Everything in Relaxed, plus grammar, punctuation, capitalization consistency, brand term inconsistency, date and number format consistency |
| Strict | Everything in Standard, plus awkward phrasing, tone drift between slides, overly long text blocks, style suggestions |

The level is chosen per check and remembered per client.

### 7.4 Results View
- Slide viewer with numbered markers on each flagged spot.
- Issue list synced with the viewer: selecting an issue highlights the spot, selecting a marker opens the issue.
- Summary at the top: total issues, issues per slide, issues by type.
- Each issue card shows: slide number, type, original text, reason, suggested fix, confidence.
- Actions per issue: Accept, Ignore, Never flag this for this client.
- Filter by type, confidence, and status.

### 7.5 Client Workspace
- Create and manage clients.
- Per client: brand dictionary (terms never flagged), ignore list, default strictness, language variant.
- Per client: history of past checks.

### 7.6 Export
- Copy all accepted corrections as a clean checklist ("Slide 3: change 'recieve' to 'receive'").
- Download the same list as a text or Markdown file.

### 7.7 Interface Direction
- The interface follows a Notion-style workspace: collapsible left sidebar, search at the top with a Ctrl+K command palette, Home with a greeting, recently checked cards and a "needs attention" list, and clients and checks that behave like pages.
- Dark mode is the design-first theme, with a light theme and a system-follow option.
- **Minimal icons.** The interface uses text labels instead of icons. Only four glyphs are allowed: sidebar toggle, chevron, ellipsis, and close. Navigation, buttons, issue types, and statuses are plain words. See the UI/UX Style Guide, section 2.

## 8. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Accept PNG, JPEG, and PDF uploads, up to 30 slides per check | Must |
| FR-02 | Reject unsupported or oversized files with a clear message | Must |
| FR-03 | Split PDFs into per-page images | Must |
| FR-04 | Natural-sort slides by filename, allow manual reorder | Must |
| FR-05 | Analyze each slide for text issues per selected strictness | Must |
| FR-06 | Return suggested fix for every issue | Must |
| FR-07 | Return a confidence level for every issue | Must |
| FR-08 | Surface "could not read clearly" regions instead of guessing | Must |
| FR-09 | Show issue markers positioned on the slide image | Must |
| FR-10 | Cross-slide consistency analysis | Must |
| FR-11 | Per-client brand dictionary and ignore list applied to every check | Must |
| FR-12 | Accept, Ignore, and "Never flag" actions per issue | Must |
| FR-13 | Copy and download corrections list | Must |
| FR-14 | Paste image from clipboard | Should |
| FR-15 | Per-client default strictness and language variant | Should |
| FR-16 | History of past checks per client | Should |
| FR-17 | Re-run a check after the designer fixes and re-exports | Should |
| FR-18 | Keyboard shortcuts for stepping through issues | Could |
| FR-19 | Command palette (Ctrl+K) searching checks, clients, and actions | Should |
| FR-20 | Notion-style app shell: collapsible sidebar with Clients tree and Recents | Must |
| FR-21 | Home page with greeting, recently checked cards, and needs-attention list | Must |
| FR-22 | Dark and light themes, following system setting by default | Should |
| FR-23 | Text-only interface: no icons beyond sidebar toggle, chevron, ellipsis, and close | Must |

## 9. Non-Functional Requirements

- **Speed:** a 10-slide carousel returns full results in under 60 seconds in normal conditions. Progress is shown per slide as results arrive.
- **Accuracy:** at least 95 percent of real typos in the test set are caught on Standard. No more than 1 false alarm per 5 slides on Standard.
- **Privacy:** client designs are confidential. See Security section.
- **Reliability:** a failed slide does not fail the whole check. It is marked and can be retried alone.
- **Accessibility:** WCAG 2.1 AA for the interface.
- **Responsive:** fully usable on desktop and tablet, readable on mobile.
- **Cost control:** per-check cost is tracked and capped by file count and image size.

## 10. Security and Privacy Requirements

- All uploads are validated by file signature, not only extension.
- Files are stored privately and served through short-lived signed URLs.
- Images are stripped of metadata on upload.
- Default retention is 30 days, with a one-click "delete this check now" option and a per-client retention setting.
- AI provider keys live only on the server and never reach the browser.
- Rate limiting and per-check file and size limits on all upload and analysis endpoints.
- Data model is organized by workspace and client from day one so row-level access control can be switched on when other users are added.
- No client design content is used for anything other than producing that client's check results.

## 11. Issue Taxonomy

| Type | Example |
|---|---|
| Spelling | "recieve" |
| Repeated word | "the the" |
| Grammar | "Your going to love it" |
| Punctuation | Missing full stop, double spaces, inconsistent quotation marks |
| Capitalization | Title Case on slide 2, sentence case on slide 5 |
| Brand inconsistency | "Horode" on one slide, "HORODE" or "Horrode" on another |
| Format inconsistency | "12th Nov" vs "November 12" |
| Placeholder text | "Lorem ipsum", "Your text here" |
| Duplicate content | Same sentence on two slides |
| Cut-off text | Text clipped at slide edge |
| Style (Strict only) | Awkward phrasing, tone drift |
| Unreadable | Region the model could not read with confidence |

## 12. Success Metrics

- Client-reported text mistakes per month: target zero within 60 days of daily use.
- Average time from upload to finished review: under 2 minutes.
- Share of flagged issues accepted: above 70 percent on Standard (a proxy for trust).
- Share of checks run before delivery: above 90 percent of carousels.

## 13. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| False alarms erode trust | High | Confidence levels, "Never flag" learning, Standard default, golden test set |
| Stylized fonts or busy backgrounds misread | High | "Could not read clearly" state, never present low-confidence guesses as facts |
| Intentional rule-breaking copy flagged | Medium | Relaxed mode, per-client dictionary and ignore list |
| Nigerian English or Pidgin flagged as errors | Medium | Language variant setting, per-client tone note |
| Client confidentiality | High | Private storage, signed URLs, retention controls |
| Model cost grows with usage | Medium | Image downscaling, caps, cost tracking per check |
| Marker positions slightly off | Medium | Verify location against recognized text, fall back to slide-level flag |

## 14. Assumptions

- Exports are reasonably legible (minimum 1080px on the short side).
- Designs are mostly in English.
- Web search or internet access is not required for proofreading.
- The primary device is a laptop or desktop.

## 15. Open Questions

1. Should accepted fixes be tracked so a re-check confirms they were applied?
2. Should there be a client-facing "proofread by Horode Proof" report later?
3. What retention period do clients expect for confidential work?
4. Is Pidgin a supported variant at launch, or flagged as "do not check"?

## 16. Out of Scope, Future Phases

- Phase 2: Drive link import, tone and consistency deepening, check reports.
- Phase 3: Figma link import (real text layers), hierarchy and structure checks.
- Phase 4: Accounts, teams, billing, public offering to other designers.
