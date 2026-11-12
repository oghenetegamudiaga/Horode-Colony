# Horode Proof: Information Architecture Document

**Version:** 1.1 (Notion-style navigation)
**Purpose:** Define how the product is organized: what exists, where it lives, how people move between things, and how the data relates.

---

## 1. Structure Principles

1. **Client first.** Everything a designer checks belongs to a client. This matches how Horode works and becomes "workspaces" later.
2. **Sidebar is the map.** Like Notion, the left sidebar shows where you are and lets you jump anywhere: search, Home, New check, Clients with their checks, and Recents.
3. **Shallow navigation.** No screen more than three clicks from Home. Search (Ctrl+K) makes it zero.
4. **Pages, not panels.** Clients and checks behave like pages you open, not dashboards you configure.
5. **Results are the center of gravity.** Every path leads to, or back from, the results screen.
6. **Text-first labels.** With almost no icons, every navigation label must be plain and short.
7. **Future-ready, not future-built.** The structure supports accounts and teams without showing them yet.

## 2. Object Hierarchy

```
Workspace (Horode Design Studio)
  |
  +-- Client
        |-- Settings (default strictness, language variant, tone note, retention)
        |-- Brand Dictionary (terms)
        |-- Ignore List (rules)
        |
        +-- Check (one carousel or batch)
              |-- Strictness used
              |-- Slides (ordered)
              |     +-- Issues (per slide)
              +-- Cross-slide Issues
```

| Object | Description |
|---|---|
| Workspace | Container for everything. One in the MVP, shown only as the logo mark at the top of the sidebar. |
| Client | A brand or customer Horode designs for. |
| Check | One proofreading run on a set of slides. |
| Slide | One image, one position in the check. |
| Issue | One flagged problem with a suggested fix and a status. |
| Dictionary term | A word or phrase that must never be flagged for a client. |
| Ignore rule | A specific flagged text the designer marked as intentional. |

## 3. Sitemap

```
/                          Home
/checks/new                New check
/checks/[id]               Results
/clients                   Clients list
/clients/new               Add client
/clients/[id]              Client page
    /clients/[id]/dictionary
    /clients/[id]/ignore
    /clients/[id]/history
    /clients/[id]/settings
/settings                  Settings
```

Search and commands are a layer (Ctrl+K) available on every page, not a page of their own.

**Reserved for later (not built in MVP):**
`/login`, `/team`, `/billing`, `/reports/[id]`, `/integrations`

## 4. Global Navigation: The Sidebar

Collapsible, 260px, same on every page.

| Order | Element | Behavior |
|---|---|---|
| 1 | Sidebar toggle and workspace logo mark | Collapses or opens the sidebar |
| 2 | Search field, hint "Ctrl+K" | Opens the command palette |
| 3 | Home | Goes to `/` |
| 4 | New check | Goes to `/checks/new` |
| 5 | **Clients** (section) | Each client is a row with a chevron. Expanding shows that client's most recent checks. "All clients" link at the end of the list |
| 6 | **Recents** (section) | Last viewed checks, most recent first, long names truncated |
| 7 | User name with chevron (bottom) | Menu: Settings, Appearance, Keyboard shortcuts |

**Rules**
- Selected item gets the accent-soft background.
- The active client stays expanded when you are inside one of its checks.
- Section labels are small muted text, never headings.
- On tablet the sidebar starts collapsed. On mobile it becomes a slide-over menu opened from a "Menu" text button.

## 5. Command Palette (Ctrl+K)

A centered panel, available everywhere.

| Group | Contains |
|---|---|
| Checks | Matches by check name or client name |
| Clients | Matches by client name |
| Actions | New check, Add client, Copy corrections (on Results), Switch theme |

Behavior: type to filter, arrows to move, Enter to open, Esc to close. Empty input shows Recents and Actions.

## 6. Page Inventory

### 6.1 Home (`/`)
**Purpose:** Pick up where you left off and start a new check.
**Contains**
- Greeting: "Good morning, Tega" (changes with time of day)
- **Recently checked:** a row of cards, each with a slide preview strip, check name, client and relative time
- **Needs attention:** a list of checks that still have open issues: name, client, open count
- First-time state: "Nothing here yet. Start with a new check." and a primary button

### 6.2 New Check (`/checks/new`)
**Purpose:** Get slides in and start analysis.
**Contains**
- Check title (defaults to client name plus date)
- Client selector (preselected from the active client)
- Dropzone and paste support
- Thumbnail strip with reorder and "Remove" links
- Strictness control: Relaxed, Standard, Strict, with its one-line description
- "Check slides" primary button

### 6.3 Results (`/checks/[id]`)
**Purpose:** Review, resolve, and export. The most important page.
**Contains**
- Page title (check name) with client name beneath it
- Summary line: "7 issues across 10 slides", type tags as filters, "5 of 7 resolved"
- Slide viewer with numbered markers
- Thumbnail strip with per-slide issue counts and status words
- Issue list with filters (type, confidence, status) and grouping (by slide, by type, by confidence)
- Cross-slide issues section
- Actions: Copy corrections, Download list, Re-run check, and an overflow menu holding "Delete this check now"
- States: analyzing, partial, failed slide, clean

### 6.4 Clients (`/clients`)
**Purpose:** Find and manage clients.
**Contains**
- Plain list: name, number of checks, last check date
- Search field
- "Add client" button

### 6.5 Client Page (`/clients/[id]`)
**Purpose:** Manage everything about one client. Reads like a Notion page.
**Contains**
- Large client name as the page title
- Plain text tabs: Overview, Dictionary, Ignore list, History, Settings
- **Overview:** recent checks as cards, a "New check for this client" button
- **Dictionary:** editable list with inline add, optional note per term
- **Ignore list:** entries created by "Never flag", each with a "Remove" link
- **History:** all checks for this client as a list
- **Settings:** default strictness, language variant, tone note, retention period, delete client

### 6.6 Settings (`/settings`)
**Purpose:** Global preferences.
**Contains**
- Appearance: System, Light, Dark
- Keyboard shortcuts reference
- Default retention period
- Data and privacy summary

## 7. Core User Flows

### Flow A: Check a carousel (the daily flow)
1. Open the app, press "New check" (or Ctrl+K, then "New check").
2. Confirm the client, drop slides.
3. Confirm strictness, press "Check slides".
4. Land on Results, watch slides complete.
5. Step through issues with the keyboard, accepting or ignoring each.
6. Press "Copy corrections".
7. Fix the design in Figma or Affinity, re-export.
8. Optionally press "Re-run check" with the new export.

### Flow B: Teach the tool about a client
1. During review, an issue is intentional.
2. Open the overflow menu, choose "Never flag this for [Client]".
3. The rule is saved and the issue clears.
4. Later, review or remove it from the client's Ignore list.

### Flow C: Set up a new client
1. Clients, then "Add client".
2. Enter the name, choose default strictness and language variant.
3. Add brand terms to the dictionary.
4. Start the first check.

### Flow D: Remove confidential work
1. Open the check.
2. Open the overflow menu, choose "Delete this check now".
3. Confirm in a dialog that names what will be deleted.
4. Files and records are removed and you return to Home.

### Flow E: Recover from a failed slide
1. Results shows one slide as "This slide didn't finish."
2. Press "Try again" on that slide.
3. Only that slide reruns. Other results stay untouched.

### Flow F: Jump straight to work
1. Press Ctrl+K anywhere.
2. Type part of a check or client name.
3. Press Enter to open it.

## 8. Data Relationships

| From | To | Relationship |
|---|---|---|
| Workspace | Client | One to many |
| Client | Check | One to many |
| Client | Dictionary term | One to many |
| Client | Ignore rule | One to many |
| Check | Slide | One to many, ordered |
| Slide | Issue | One to many |
| Check | Cross-slide issue | One to many, each references several slides |

**Rules**
- Deleting a check deletes its slides, issues, and stored files.
- Deleting a client requires choosing what happens to its checks (delete all, or cancel).
- Dictionary terms and ignore rules apply only to their own client.

## 9. Naming Conventions

| Thing | Name used in the interface |
|---|---|
| A proofreading run | Check |
| An image in a check | Slide |
| A flagged problem | Issue |
| Suggested correction | Suggested fix |
| Words never flagged | Brand dictionary |
| Intentional exceptions | Ignore list |
| Strictness levels | Relaxed, Standard, Strict |
| Issue statuses | Open, Accepted, Ignored |

Keep these names identical in the interface, the database, and the code.

## 10. Issue Organization Inside Results

**Grouping (switchable, default by slide):**
- By slide: follows the carousel order
- By type: all spelling together, all grammar together
- By confidence: low-confidence items together

**Sorting inside a group:** reading order, top to bottom and left to right.

**Statuses:** Open (needs a decision), Accepted (will fix), Ignored (fine as is). A progress line reads "5 of 7 resolved" so the review has a clear end.

## 11. Search and Filtering

- Global: Ctrl+K command palette covers checks, clients, and actions.
- Home and Clients: filter by client, search by name.
- Results: filter by type, confidence, and status.
- Dictionary and Ignore list: simple text search.

## 12. Feedback and Notifications

- In-app only in the MVP: per-slide progress while analyzing, small toasts for copy and resolve actions, with "Undo" where it applies.
- No email or push notifications until accounts exist.

## 13. Permissions (Future)

The MVP has one implicit user. The structure anticipates:

| Role | Can do |
|---|---|
| Owner | Everything, including billing and deleting the workspace |
| Member | Create and review checks, manage clients |
| Viewer | View results only |

Row-level security is written from the start so roles can be switched on without restructuring data.

## 14. URL and Deep Link Rules

- Check URLs use unguessable identifiers, never sequential numbers.
- Opening a check URL requires access to its workspace once accounts exist.
- Selecting a slide or issue updates a plain hash such as `#slide-4`, so a specific spot can be revisited.

## 15. Future Extensions (Placeholders)

| Feature | Where it will live |
|---|---|
| Drive link import | New check, "Import from link" tab |
| Figma link import | New check, "Import from Figma" tab |
| Hierarchy checks | Results, new "Structure" issue group |
| Shareable report | Results, "Share report" action, `/reports/[id]` |
| Team and roles | `/team` |
| Billing | `/billing` |

## 16. Open Structure Questions

1. Should a check always be one carousel, or can it hold several?
2. Should clients have an archive state instead of being deleted?
3. Should the dictionary support grouping (for example, product names and people names)?
4. Should ignore rules expire, or stay until removed?
5. Should the sidebar Clients section show every client or only pinned ones once the list grows?
