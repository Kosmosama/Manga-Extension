# Translations – Contribution Guide

This project uses Transloco for i18n.

1. Key naming
- Hierarchical, dotted keys:
  - app.title, actions.add, actions.edit, actions.delete
  - form.title.label, form.title.placeholder
  - settings.theme.light, settings.theme.dark, settings.theme.system
  - errors.title.required, errors.title.duplicate
- Reuse where possible. Prefer consistent verbs for actions: add, edit, delete, save, cancel, favorite, unfavorite.

2. Locale files
- Location: src/assets/i18n/{lang}.json
- en.json is the baseline. Other languages must mirror its structure.
- Keep alphabetical ordering within objects for easier diffing.

3. Pluralization / interpolation (lightweight pattern)
- Use simple placeholders where needed:
  - "chapters.read_count": "{value} chapter" / "{value} chapters"
- If you need plural rules beyond simple cases, propose them in an issue.

4. Developer language
- A special language code dev renders keys instead of values for debugging.
- Use the “Developer language (show keys)” toggle in Settings when wiring is complete.

5. Adding new keys
- Add to en.json first.
- Run: node scripts/i18n/scan-transloco-keys.js to ensure keys are discovered.
- Run: node scripts/i18n/scan-untranslated-text.js to catch raw strings left in templates.
- Add the same keys to other locales with TODO placeholders if untranslated yet.

6. Do/Don’t
- Do not hardcode user-visible strings in templates or components.
- Do use Transloco pipe in templates: {{ 'actions.add' | transloco }}
- Do use TranslocoService.selectTranslate('key') in TypeScript when needed.