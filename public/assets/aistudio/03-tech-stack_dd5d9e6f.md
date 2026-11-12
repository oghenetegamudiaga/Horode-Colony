# Horode Proof: Tech Stack Document

**Version:** 1.0
**Principle:** Pick boring, well-supported tools. Keep the AI parts behind one clean interface. Keep every client file private by default.

---

## 1. Stack at a Glance

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) with TypeScript | One codebase for UI and server logic, easy deploys, strong ecosystem |
| Styling | Tailwind CSS with design tokens | Fast, consistent, maps directly to the Style Guide |
| Components | shadcn/ui (Radix primitives), restyled to a Notion-like look | Accessible by default, fully customizable |
| Command palette | cmdk | Powers the Ctrl+K search and commands panel |
| Typography | Inter and JetBrains Mono via the framework font loader | Matches the Style Guide, no layout shift |
| Theming | CSS variables with a dark default and light variant, system-follow | One token set drives both themes |
| Icons | None. Four inline SVG glyphs only (sidebar toggle, chevron, ellipsis, close) | Enforces the minimal-icon rule and removes a dependency |
| Database | Supabase Postgres | Relational data, row-level security ready for multi-user later |
| File storage | Supabase Storage (private buckets) | Signed URLs, simple, same platform as the database |
| Auth | None in MVP, Supabase Auth ready for Phase 4 | Internal tool first, data model already workspace-aware |
| AI analysis | Anthropic API, vision-capable Claude model | Strong at reading text in images, structured output, high quality language judgment |
| Validation | Zod | One schema for forms, API inputs, and AI output |
| Image processing | sharp (server) | Metadata stripping, resizing, format normalization |
| PDF handling | Native PDF input to the model for analysis, pdfjs-dist for page thumbnails | Avoids lossy conversions where possible |
| Background work | Start with in-request processing and polling, move to a job queue when needed | Keeps the MVP simple |
| Testing | Vitest, Playwright | Unit and end-to-end coverage |
| Hosting | Vercel (app), Supabase (data and files) | Low ops overhead |
| Monitoring | Sentry for errors, simple usage and cost table in the database | Know when things break and what it costs |

## 2. Architecture

```
Browser
  |  upload files (signed upload URLs)
  v
Supabase Storage (private bucket)
  ^
  |  read via short-lived signed URL
  |
Next.js server (API routes / server actions)
  |-- validates input (Zod)
  |-- normalizes images (sharp)
  |-- builds analysis request
  v
AnalysisService (single interface)
  |-- ModelProvider (Anthropic adapter)
  |-- applies strictness profile + client dictionary + ignore list
  |-- validates model output against schema
  v
Postgres
  clients, checks, slides, issues, dictionary_terms, ignore_rules, usage
```

**Key design decision:** all AI calls go through one `AnalysisService` with a `ModelProvider` interface. The model can be swapped or upgraded by changing config, without touching the UI or data model.

## 3. AI Analysis Design

### 3.1 Model choice
- Default: a current Claude Sonnet-class model for per-slide analysis (good balance of speed, cost, and reading accuracy).
- Optional escalation: re-run only low-confidence slides on a stronger model.
- The model name is an environment variable, never hardcoded.

### 3.2 Per-slide analysis
- Input: the slide image, strictness level, language variant, client dictionary, ignore list.
- Output: JSON only, validated by Zod:

```json
{
  "slide_text": "full text as read, in reading order",
  "unreadable_regions": [
    { "description": "text over busy photo, lower left", "bbox": [x, y, w, h] }
  ],
  "issues": [
    {
      "type": "spelling",
      "original": "recieve",
      "suggestion": "receive",
      "reason": "Misspelling of 'receive'",
      "confidence": "high",
      "bbox": [x, y, w, h]
    }
  ]
}
```

- Coordinates are normalized (0 to 1) relative to the image so they survive resizing.
- Responses that fail schema validation are retried once, then the slide is marked failed and can be retried alone.

### 3.3 Cross-slide pass
- After all slides finish, a second call receives only the extracted `slide_text` for each slide (no images) plus the dictionary.
- It looks for brand term variants, capitalization style drift, date and number format drift, and duplicated lines.
- Text-only means this pass is fast and cheap.

### 3.4 Strictness profiles
Strictness is a server-side prompt profile, not separate code paths. Relaxed, Standard, and Strict are three versions of the instruction block with explicit lists of what to flag and what to leave alone.

### 3.5 Location trust
The tool never trusts a bounding box blindly. Each issue's `original` text must appear in the slide's recognized text. If not, the issue is kept but shown at slide level instead of with a marker.

### 3.6 Cost controls
- Downscale images to a sensible maximum before analysis, keep the original for display.
- Cap slides per check and file size per slide.
- Record tokens and estimated cost per check.
- On re-check, skip slides whose file hash is unchanged.

## 4. Data Model

```
workspaces        id, name, created_at            (single row in MVP)
clients           id, workspace_id, name, default_strictness, language_variant, tone_note, retention_days
dictionary_terms  id, client_id, term, note
ignore_rules      id, client_id, original, rule_type, created_at
checks            id, client_id, strictness, status, slide_count, issue_count, cost_estimate, created_at, expires_at
slides            id, check_id, position, storage_path, file_hash, status, slide_text
issues            id, slide_id, type, original, suggestion, reason, confidence, bbox, status (open|accepted|ignored), scope (slide|cross_slide)
usage_log         id, check_id, input_tokens, output_tokens, cost_estimate
```

Every table that belongs to a client carries a path back to `workspace_id`, so row-level security can be enabled in Phase 4 without restructuring.

## 5. Project Structure

```
/app                    routes and pages
  /(app)/clients
  /(app)/clients/[id]
  /(app)/checks/new
  /(app)/checks/[id]
  /api/...
/components             UI components
/lib
  /analysis             AnalysisService, prompts, schemas, providers
  /images               normalize, split, hash
  /db                   queries, types
  /config               validated env config
/tests
  /golden               labeled slides + expected issues
/docs                   these documents
```

## 6. Environment Variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Server-only model access |
| `ANALYSIS_MODEL` | Model name, changeable without code edits |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Client-safe project access |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged access |
| `MAX_SLIDES_PER_CHECK` | Cost and abuse cap |
| `MAX_FILE_SIZE_MB` | Upload cap |
| `DEFAULT_RETENTION_DAYS` | Retention default |

All variables are read through one validated config module that fails fast at startup if anything is missing.

## 7. Security Architecture Checklist

This section is a pass or fail gate for Milestone M6, and each item should be checked as code is written.

**Secrets and keys**
- [ ] No API keys in client code, repository, or logs.
- [ ] Service role key used only in server code.
- [ ] `.env` files ignored by version control, example file contains names only.

**Uploads**
- [ ] File type verified by magic bytes, not extension or MIME header alone.
- [ ] Size and count limits enforced on the server, not just in the browser.
- [ ] Image metadata (EXIF, GPS) stripped on ingest.
- [ ] PDFs processed in a way that does not execute embedded content.
- [ ] Filenames sanitized, storage paths generated server-side (never from user input).

**Storage and access**
- [ ] Buckets are private.
- [ ] All file access through short-lived signed URLs.
- [ ] A user cannot guess or enumerate another check's files.
- [ ] Row-level security policies written and tested, even if only one workspace exists.

**API and abuse**
- [ ] Every endpoint validates input with Zod.
- [ ] Rate limiting on upload and analysis routes.
- [ ] Per-check caps prevent runaway model spend.
- [ ] Errors returned to the client contain no stack traces or internal details.

**AI-specific**
- [ ] Text inside a slide is treated as data, never as instructions. The system prompt states this explicitly, and output is schema-validated so injected text cannot change behavior.
- [ ] Model output is escaped before rendering, never injected as raw HTML.
- [ ] Dictionary and ignore-list text is length-limited and sanitized before being placed in prompts.

**Privacy and retention**
- [ ] Retention job deletes expired files and rows.
- [ ] "Delete this check now" removes files and database records.
- [ ] Client content is not used for anything beyond producing that client's results.
- [ ] Logs never contain slide text or image data.

**Dependencies and deploy**
- [ ] Dependency audit in CI.
- [ ] Security headers set (CSP, X-Content-Type-Options, frame protections).
- [ ] HTTPS only.

## 8. Testing Strategy

- **Golden set:** 30+ real slides with labeled errors, including stylized fonts, busy photos, low contrast, and intentional lowercase brand styles. Scored for catch rate and false alarm rate on every strictness level. Re-run after any prompt change.
- **Unit tests:** schema validation, filename sorting, location verification, dictionary and ignore-list application.
- **End-to-end tests:** upload, wait for results, resolve issues, export checklist.
- **Failure tests:** corrupt file, huge file, model timeout, invalid model output.

## 9. Performance Notes

- Analyze slides in parallel with a concurrency limit to stay under rate limits.
- Stream per-slide results to the UI as each finishes.
- Cache thumbnails and signed URLs sensibly.
- Keep any single server request short. If processing outgrows request limits, move to a queue (Inngest or Trigger.dev) without changing the data model.

## 10. Future Stack Additions

| Phase | Addition |
|---|---|
| Phase 2 | Google Drive API (read-only, user-granted) |
| Phase 3 | Figma REST API for real text layers and font sizes |
| Phase 4 | Supabase Auth, billing (Stripe), transactional email, analytics |

## 11. Decisions to Revisit

- Move to a job queue once typical checks exceed comfortable request time.
- Add a second model provider if cost or availability demands it. The adapter interface already allows this.
- Consider an on-device or browser-side first pass for obvious typos if latency matters.
