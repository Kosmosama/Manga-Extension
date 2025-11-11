# TODO

Note: This list excludes translations/more languages and adding “System” to the theme selector. It also excludes Testing and Housekeeping.

## 1. Internationalization (i18n) & Localization

### Core integration

- [ ] Replace hard‑coded UI strings in Angular templates with Transloco (pipe `{{ 'key' | transloco }}` or structural directive).  (Settings page converted; remaining views pending)
- [x] Establish naming convention for keys (e.g., `manga.card.favorite`, `settings.theme.label`, `tags.list.empty`).
- [x] Create/enrich base language files:
  - [x] en.json (complete baseline, migrate keys from legacy `translations.js`).
  - [x] es.json (synchronized with English).
- [x] Implement a language selector component/page (integrate with `SettingsService.changeLanguage()`).
- [x] Ensure language selector persists choice and updates live (improved initialization & storage sync in SettingsService).
- [ ] Fallback behavior: Verify fallbackLang works when a key is missing in a non-default language.
- [x] Missing key logging:
  - [x] Disable `logMissingKey` in production builds.
  - [x] Provide dev-only overlay or console grouping for missing keys (MissingKeysOverlay + CollectMissingHandler).
  
### Expansion workflow

- [x] Add stub language files (e.g., `de.json`, `fr.json`) with identical structure but empty or auto-copied values.
- [x] Script: Extract all used translation keys (Transloco keys manager or custom scan) and diff against JSON files to detect drift.
- [x] Document translation contribution guidelines (key naming, pluralization if needed).
- [ ] Optional: Introduce simple pluralization patterns or dynamic replacements (e.g., `chapters.read_count` -> “1 chapter” / “{value} chapters”).

### UX localization coverage

- [ ] Modals: titles, buttons (Save, Cancel, Delete confirmation).
- [ ] Toasts / notifications.
- [ ] Form placeholders (title, link, image URL).
- [ ] Empty states (no mangas, no tags).
- [ ] Settings section labels. (Partially localized; full segmentation pending)
- [ ] Keyboard shortcut help overlay entries.

### Quality checks

- [x] Add a pre-build script to validate that no untranslated hard-coded text remains (heuristic scan of templates).
- [x] Provide a “Developer language” toggle (shows key names instead of values) to spot incorrect mappings. (Dev language exists, toggle component implemented; wire into Settings)

---

## 2. Theming (Light / Dark / System)

### System mode support

- [x] Extend Settings UI to include “System” option alongside Light/Dark (Theme enum already has `System`).
- [x] Detect system preference via `prefers-color-scheme` (already in `ThemeService.getSystemTheme()`).
- [x] Listen for OS theme changes when System mode is active (`matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)`).
- [x] Unify approach: choose between using `data-theme="dark|light"` vs toggling a `dark` class. Ensure consistency across CSS.
- [x] Persist user choice (`chrome.storage.local` already used). Add migration if stored values were only light/dark in older versions.

### Visual fidelity

- [x] Introduce CSS variables for colors; reference them in component styles for simpler theme swapping.
- [x] Smooth transitions (short `transition: background-color .15s, color .15s`).
- [ ] Verify fallback images and illustrations adapt (light/dark variants).
- [ ] Ensure modals and overlays respect theme in high contrast.

### Resilience

- [x] Early apply theme script BEFORE Angular bootstrap (avoid flash):
  - [x] Inline snippet to read stored theme and set `data-theme` or `class="dark"` if needed.
  - [x] Fallback to system preference if storage not yet available.
- [x] Sync across multiple open extension views via `chrome.storage.onChanged`.

### Developer utilities

- [ ] Optional debug panel: show current theme + system detection + resolved palette.

---

## 3. Keyboard Shortcuts (Customizable)

### Action catalog

- [ ] Define actions: `OPEN_ADD`, `OPEN_EDIT`, `FOCUS_SEARCH`, `TOGGLE_FAVORITE`, `INC_CHAPTER`, `DEC_CHAPTER`, `OPEN_SETTINGS`, `OPEN_TAGS`, `TOGGLE_THEME`, `SHOW_SHORTCUT_HELP`.
- [ ] Context separation (global vs list vs modal). Ensure modals override conflicting shortcuts cleanly.

### Implementation

- [ ] `HotkeysService` to register/unregister shortcuts; store user mappings in `chrome.storage.sync`.
- [ ] Shortcut capture UI in Settings (press key/combo to assign).
- [ ] Conflict detection (warn and allow override).
- [ ] Reset defaults (per-key and global reset).
- [ ] Provide an overlay (opened via “?” default) listing current shortcuts (localized).

### Integration

- [ ] Show key hints on hover/tooltips (“Add (A)”).
- [ ] Extension level commands in `manifest.json` for a small subset (Chrome-managed global shortcuts).
- [ ] Sync live across pages (storage change listener).

---

## 4. Code Quality & Correctness

### Service lifecycle

- [x] Fix `SettingsService`: move initialization logic (currently in `ngOnInit`) into constructor or an explicit `init()` called from `provideAppInitializer`.
- [x] Add defensive checks around storage access (graceful fallback if Chrome APIs unavailable—e.g., testing environment).

### Manga card chapter updates

- [x] Replace current `map()` producing Observables with `switchMap/concatMap`.
- [x] Implement batching: accumulate increments for a short debounce period before persisting.
- [x] Provide busy state (while persisting).

### Fallback images

- [x] Move assets to `src/assets/fallback-images/`.
- [x] Reference via `assets/...` paths (Angular’s asset handling).
- [x] Add actual `<img (error)="imageNotFound()">` usage.

### Cleanup

- [ ] Remove unused imports (`is`, `theme-change` if not used).
- [ ] Enforce lint rules (once housekeeping reintroduced).

---

## 5. Main Functionality

### Manga cards

- [ ] Edit button flows into populated form modal.
- [ ] Favorite toggle: optimistic update + rollback on error.
- [ ] Broken image state: show fallback + small reload button.

### Manga page

- [ ] Responsive grid/list toggle.
- [ ] Empty state messaging with localized call-to-action.

### Tags

- [ ] CRUD UI for tags (create/edit/delete).
- [ ] Assign tags in add/edit form (multi-select).
- [ ] Tag badges on cards (click to filter).
- [ ] Filter bar: multi-tag AND/OR modes.

### Form (Add/Edit)

- [ ] Live image preview (debounced).
- [ ] Validation (required, URL pattern, uniqueness).
- [ ] Accessible labels, focus trapping on modal open.
- [ ] Distinct Save vs Cancel outcomes (announce via toast).

### Import / Export

- [ ] Import JSON (validate schema; partial successes reported).
- [ ] Export current library (download JSON).
- [ ] Import from bookmarks (progress indicator, summary of imported/ignored).
- [ ] Collision handling (duplicate titles -> choose merge/skip).
- [ ] Error messaging localized.

---

## 6. Settings Polish

- [x] Focus search input toggle (already stored, needs UI).
- [x] Real-time sync via storage change events.
- [ ] Settings segmentation: Theme, Language, Shortcuts, Behavior (focus search, tags view preferences).

---

## 7. UX & Feedback

- [ ] Delete confirmation modal (with manga title shown).
- [ ] Toasts for: add, edit, delete, import, export, language change, theme change, shortcut updated.
- [ ] Loading skeleton for manga list & image placeholders.
- [ ] Inline form validation errors (localized).

---

## 8. Performance

- [ ] Virtual scroll (CDK) for large lists.
- [ ] Debounced search (URL query param for sharable state).
- [ ] Lazy-load images + IntersectionObserver prefetch near viewport.
- [x] Chapter update batching (see Code Quality).

---

## 9. Data & Persistence

- [ ] Use `crypto.randomUUID()` for new IDs.
- [ ] Data versioning (e.g., `{ version: 1 }` in storage root) + migration layer.
- [ ] Distinguish sync vs local storage usage:
  - [ ] Sync: theme, language, shortcuts, focus preference.
  - [ ] Local: manga library, cover images metadata cache.
- [ ] Unique title enforcement with immediate feedback and translation key `errors.title.duplicate`.

---

## 10. Accessibility

- [ ] Modal: trap focus, ESC closes, ARIA attributes.
- [ ] Keyboard navigation: tab order, space/enter activation, shortcuts accessible but overridable.
- [ ] Alt attributes: fallback to manga title or localized “No image available”.
- [ ] High contrast adaptation: allow user override of color tokens if needed (future extension).
- [ ] Shortcut help overlay accessible via keyboard and screen readers.

---

## 11. Extra Functionalities (In-Page Capture & Rich Enhancements)

### In-page capture UI (content script)

- [ ] Inject FAB / side panel on allowed domains; toggleable in Settings.
- [ ] Scoped styling (Shadow DOM or unique namespace).

### Image picker

- [ ] Activate “Pick cover” mode; click any page image to select.
- [ ] Visual highlight on hover; cancel option.
- [ ] Right-click context menu item: “Use this image as cover”.

### Autofill

- [ ] Extract metadata: `document.title`, Open Graph `og:title`, `og:image`.
- [ ] Heuristic to pick best image: prioritize og:image, then largest non-sprite image.

### Context menus

- [ ] “Add to Manga Library” (page level).
- [ ] “Use selected text as title”.
- [ ] “Use this image as cover” (image context).

### In-page shortcuts (customizable)

- [ ] Extend keyboard shortcut system with “content-script scope”.
- [ ] Sync mappings to background; dispatch actions via messaging.

### Domain safety & resilience

- [ ] Denylist (chrome://, internal pages, store, banking).
- [ ] Graceful failure when CSP blocks injection (inform user with toast).

### Preferences

- [ ] Settings toggles for: In-page panel, image picker, context menus, quick capture.
- [ ] Persist and sync across devices.

### Quick capture

- [ ] One-key quick add (e.g., Shift+Q) using auto-extracted metadata; shows undo toast.
- [ ] Undo within 5–10 seconds window.

---

## 12. Developer / Diagnostic (Optional Future)

- [ ] “Show keys instead of strings” developer mode for translation debugging. (Dev language present; toggle mechanism implemented as component; integrate in Settings)
- [ ] Theme debug panel listing resolved variables and source of theme (user/system).
- [ ] Shortcut conflict inspector.

---

## 13. Translation Key Map (Initial Draft Reference)

(Not exhaustive – populate progressively)

```json
{
  "app": { "title": "Manga Library" },
  "actions": {
    "add": "Add Manga",
    "edit": "Edit",
    "delete": "Delete",
    "confirmDelete": "Confirm deletion",
    "cancel": "Cancel",
    "save": "Save",
    "favorite": "Favorite",
    "unfavorite": "Unfavorite"
  },
  "form": {
    "title.label": "Title",
    "title.placeholder": "Leave blank to use page title",
    "image.label": "Image URL",
    "image.placeholder": "Provide the image URL (optional)",
    "link.label": "Link",
    "link.placeholder": "Leave blank to use current page URL"
  },
  "errors": {
    "title.required": "Title is required.",
    "title.duplicate": "Title must be unique.",
    "file.invalidType": "Invalid file type.",
    "file.invalid": "Invalid file.",
    "file.parseError": "Could not parse file.",
    "import.partial": "Some entries were invalid and skipped."
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "theme": "Theme",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
    "shortcuts": "Keyboard Shortcuts",
    "focusSearch": "Auto-focus search on load",
    "devLanguage": "Developer language (show keys)",
    "devLanguage.hint": "Turn on to render keys instead of strings for debugging.",
    "devLanguage.on": "Developer language is ON (keys are shown)."
  }
}
```

(Extend with tags, toasts, extra actions, etc.)

---

## Ordering Suggestion (Execution Phases)

1. Fix service initialization + chapter batching (foundation).
2. Introduce i18n across existing views (English/Spanish baseline).
3. Add System theme option + early apply script + CSS variable refactor.
4. Implement keyboard shortcut engine (fixed defaults).
5. Tag system + search/filter improvements.
6. Import/Export + bookmarks integration.
7. UX polish (toasts, confirmation, skeletons).
8. In-page capture + content script enhancements.
9. Additional languages + advanced localization tooling.
10. Performance (virtual scroll) + data versioning.

---

## Acceptance Criteria Examples

- Internationalization: Switching language updates all visible strings without reload; missing key overlay appears only in dev.
- System theme: Selecting “System” changes automatically when OS theme flips.
- Shortcuts: User can remap “Add Manga” from A to Ctrl+Shift+M; change persists and works after reload.
- Fallback image: Broken cover shows themed fallback (verified in both light/dark).
- In-page capture: On a manga site page, pressing the quick capture shortcut adds a manga with extracted title and cover, and shows undo toast.
