# TODO

Note: This list excludes translations/more languages and adding “System” to the theme selector. It also excludes Testing and Housekeeping.

## 1. Internationalization (i18n) & Localization

### Core integration

- [ ] Replace hard‑coded UI strings in Angular templates with Transloco (remaining views in progress)
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
- [x] Script: Extract all used translation keys and diff against JSON files to detect drift.
- [x] Document translation contribution guidelines (key naming, pluralization if needed).
- [ ] Optional: Introduce simple pluralization patterns or dynamic replacements.

### UX localization coverage

- [ ] Modals: titles, buttons (Save, Cancel, Delete confirmation).
- [ ] Toasts / notifications.
- [ ] Form placeholders (title, link, image URL).
- [ ] Empty states (no mangas, no tags). (Keys added; integrate everywhere)
- [ ] Settings section labels (segmentation in progress)
- [ ] Keyboard shortcut help overlay entries.

### Quality checks

- [x] Pre-build script to validate that no untranslated hard-coded text remains (heuristic scan).
- [ ] “Developer language” toggle (intentionally skipped—decision: only real languages in app for now).

---

## 2. Theming (Light / Dark / System)

### System mode support

- [x] Extend Settings UI to include “System” option alongside Light/Dark.
- [x] Detect system preference via `prefers-color-scheme`.
- [x] Listen for OS theme changes when System mode is active.
- [x] Unify approach: `data-theme` attribute.
- [x] Persist user choice (migration ready hook present).

### Visual fidelity

- [x] Introduce CSS variables (theme-tokens.css).
- [x] Smooth transitions.
- [ ] Verify fallback images adapt (light/dark variants).
- [ ] Ensure modals and overlays respect theme in high contrast.

### Resilience

- [x] Early apply theme script.
- [x] Sync across multiple open views.

### Developer utilities

- [ ] Optional debug panel (low priority).

---

## 3. Keyboard Shortcuts (Customizable)

(No changes this pass — foundation still pending)

---

## 4. Code Quality & Correctness

### Service lifecycle

- [x] SettingsService initialization fixes.
- [x] Defensive checks around storage.

### Manga card chapter updates

- [x] Replace `map()` with `switchMap/concatMap`.
- [x] Implement batching.
- [x] Provide busy state.

### Fallback images

- [x] Assets organized.
- [x] Reference via `assets/...`.
- [x] Proper `<img (error)=...>` usage.

### Cleanup

- [ ] Remove unused imports.
- [ ] Enforce lint rules.

---

## 5. Main Functionality

### Manga cards

- [x] List all mangas (basic page with search + sort).
- [x] Create manga (form minimal: title, link -> base64 cover placeholder, tags, chapters initialization).
- [ ] Edit button flows into populated form modal (partial: edit logic stub).
- [ ] Favorite toggle: optimistic update + rollback.
- [ ] Broken image state: show fallback + small reload button.

### Manga page

- [x] Basic page scaffold.
- [ ] Responsive grid/list toggle.
- [ ] Empty state messaging (keys present; integrate fully).

### Tags

- [x] CRUD UI (create/edit/delete basic).
- [x] Assign tags in add/edit form (multi-select).
- [ ] Tag badges on cards (displayed, filter logic still pending).
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

- [x] Use `crypto.randomUUID()` for new IDs.
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
