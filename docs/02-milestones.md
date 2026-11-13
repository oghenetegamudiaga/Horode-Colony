# Horode Proof: Milestone Document

**Version:** 1.0
**Build approach:** Solo founder, AI-assisted IDE build, one milestone at a time
**Estimates:** Working days, assuming focused sessions. Treat them as planning numbers, not promises.

---

## How to Use This Document

Each milestone has a goal, a task list, a deliverable, and exit criteria. Do not start the next milestone until the exit criteria of the current one are met. Every milestone ends with something you can open and use, even if small.

## Overview

| # | Milestone | Est. | Outcome |
|---|---|---|---|
| M0 | Foundations | 2 days | Project scaffolded, deployed, design tokens in place |
| M1 | Upload and storage | 3 days | Drop slides, see them ordered and previewed |
| M2 | Analysis engine | 5 days | Slides in, structured issues out |
| M3 | Results experience | 5 days | Marked-up viewer, issue cards, actions |
| M4 | Clients, dictionary, ignore list | 4 days | The tool learns each client's vocabulary |
| M5 | Consistency checks and export | 3 days | Cross-slide checks, copyable corrections |
| M6 | Hardening and internal launch | 4 days | Secure, tested, used on real client work |
| **MVP total** | | **about 26 working days** | |

Post-MVP phases are listed at the end.

---

## M0: Foundations (2 days)

**Goal:** A deployed, empty app with the right bones.

**Tasks**
- Create the repository and project scaffold per the Tech Stack document.
- Set up environment variable handling with a validated config file.
- Set up the database, private storage bucket, and migrations.
- Implement design tokens (colors, type, spacing, radius) from the Style Guide.
- Build the Notion-style app shell: collapsible sidebar (search field, Home, New check, Clients tree, Recents, user menu), dark and light themes, and empty states.
- Build the Home page layout with greeting, recently checked cards, and needs-attention list (empty states first, real data in later milestones).
- Build the Ctrl+K command palette frame (search wiring comes in M4).
- Draw the four allowed glyphs as inline SVG (sidebar toggle, chevron, ellipsis, close). Install no icon library.
- Set up linting, formatting, type checking, and a basic CI run.
- Deploy to a staging URL.

**Deliverable:** A live URL showing the shell and an empty dashboard.

**Exit criteria**
- Deploys cleanly from the main branch.
- No secrets in the repository.
- Tokens match the Style Guide.

---

## M1: Upload and Storage (3 days)

**Goal:** Get slides in reliably and ordered correctly.

**Tasks**
- Drag and drop multi-file upload with progress per file.
- File validation by signature, size limit, count limit, and clear error messages.
- PDF splitting into per-page images.
- Image normalization: metadata stripping, downscale for analysis, keep original for display.
- Natural filename sorting and manual drag reorder.
- Clipboard paste for a single image.
- Store originals privately, serve via signed URLs.

**Deliverable:** Upload a mixed batch of PNG, JPEG, and PDF and see ordered slide thumbnails.

**Exit criteria**
- A batch of 30 slides uploads and previews without errors.
- Invalid and oversized files are rejected with a helpful message.
- Files are not publicly accessible by URL guessing.

---

## M2: Analysis Engine (5 days)

**Goal:** Turn a slide image into trustworthy structured issues.

**Tasks**
- Build the analysis service on the server only.
- Write the system prompt covering the issue taxonomy and the three strictness levels.
- Define the strict output schema and validate every response against it.
- Return location for each issue and verify it against recognized text.
- Add the "could not read clearly" state.
- Run slides in parallel with a concurrency limit, retry failed slides alone.
- Build the **golden test set**: 30 or more real slides with known, labeled errors, including stylized fonts and busy backgrounds.
- Build a test runner that scores catch rate and false alarm rate per strictness level.
- Tune the prompt against the golden set.

**Deliverable:** A command or internal page that takes a batch and returns issues as data.

**Exit criteria**
- At least 95 percent catch rate on Standard against the golden set.
- No more than 1 false alarm per 5 slides on Standard.
- A failing slide does not break the batch.
- Cost per slide is measured and recorded.

---

## M3: Results Experience (5 days)

**Goal:** The part you will actually live in. It must feel fast and calm.

**Tasks**
- Slide viewer with numbered markers positioned on the image.
- Synced issue list: marker to card and card to marker.
- Issue card with original, reason, suggested fix, confidence, and actions.
- Accept, Ignore, and status tracking per issue.
- Summary header: total, per slide, by type.
- Filters by type, confidence, and status.
- Progressive results: slides appear as they finish, with a per-slide progress state.
- Loading, empty, error, and partial states.
- Keyboard shortcuts for next and previous issue, accept, and ignore.
- Strictness toggle on the upload screen.

**Deliverable:** Upload a carousel, watch results arrive, step through and resolve every issue.

**Exit criteria**
- A 10-slide carousel is reviewable end to end in under 2 minutes.
- Marker positions are correct on at least 90 percent of issues in the golden set.
- Fully usable by keyboard alone.

---

## M4: Clients, Dictionary, Ignore List (4 days)

**Goal:** The tool gets smarter for each client over time.

**Tasks**
- Client CRUD with a client switcher.
- Per-client brand dictionary: terms, names, handles, and notes on tone.
- Per-client ignore list built from the "Never flag this" action.
- Per-client default strictness and language variant.
- Apply dictionary and ignore list before and during analysis.
- Client check history list.
- Wire the Ctrl+K command palette to real checks, clients, and actions.
- Populate the sidebar Clients tree and Recents from real data.

**Deliverable:** Create a client, teach it three terms, and see them no longer flagged.

**Exit criteria**
- Dictionary terms are never flagged for that client.
- Ignore entries can be viewed and removed.
- Settings from one client never leak into another.

---

## M5: Consistency Checks and Export (3 days)

**Goal:** Catch the cross-slide mistakes a single-slide check cannot.

**Tasks**
- Cross-slide pass for brand term variants, capitalization style, number and date formats, duplicate lines.
- Surface cross-slide issues as grouped cards that reference every affected slide.
- Corrections checklist: copy to clipboard and download as text or Markdown.
- Re-run flow: upload a fixed export and compare against the previous check.

**Deliverable:** A one-click corrections checklist and a working re-check.

**Exit criteria**
- Cross-slide issues in the golden set are caught.
- The exported list is clean enough to paste straight into a message or task.

---

## M6: Hardening and Internal Launch (4 days)

**Goal:** Safe and dependable enough to use on real client work.

**Tasks**
- Run the security checklist from the Tech Stack document.
- Rate limiting, input limits, and abuse protection on all endpoints.
- Retention job and one-click "delete this check now".
- Error monitoring and basic usage and cost dashboard.
- Accessibility pass against WCAG 2.1 AA.
- Responsive pass on tablet and mobile.
- Test with 10 real past carousels from real clients and compare against known client complaints.
- Fix the top issues found.

**Deliverable:** Horode Proof in daily use inside Horode.

**Exit criteria**
- Security checklist fully passed.
- Used on at least 5 live client deliveries with no missed typos reported.
- Tega would rather use it than skip the check.

---

## Post-MVP Roadmap

**Phase 2: Convenience and depth**
- Google Drive link import
- Check reports to share with clients
- Deeper tone and consistency analysis
- Pidgin and other language variants

**Phase 3: Figma and structure**
- Figma link import using real text layers
- Hierarchy and structure checks (font size order, competing text sizes, text density)
- Better accuracy through exact text instead of reading pixels

**Phase 4: Open to other designers**
- Accounts and workspaces
- Row-level access control enabled
- Billing and plans
- Onboarding, landing page, and public launch

---

## Risk Watchlist

| Risk | Watch for | Response |
|---|---|---|
| Analysis quality plateaus | Catch rate stalls below target | Try a stronger model for hard slides only, tighten prompt, improve image preprocessing |
| Marker accuracy poor | Flags appear on wrong spot | Verify location against recognized text, fall back to slide-level flag |
| Cost creeping up | Per-check cost above plan | Downscale images, cap batch size, cache unchanged slides on re-check |
| Scope creep | Hierarchy or Figma work sneaking into MVP | Park it in the roadmap, hold the exit criteria |

## Definition of Done (applies to every milestone)

- Works on the deployed staging URL, not just locally.
- Handles loading, empty, error, and partial states.
- Types check, lint passes, and tests for new logic pass.
- No secrets, no console errors, no placeholder text.
- Reviewed against the Style Guide, including the icon policy: no icons beyond the four allowed glyphs, and every label is plain text.
