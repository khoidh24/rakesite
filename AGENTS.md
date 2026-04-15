<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:i18n-rules -->

# All user-facing text must use locale keys

Never hardcode display text in components. All strings shown to the user must be defined in `i18n/locale/en.json` and `i18n/locale/vi.json`, then accessed via `useTranslations()` (client) or `getTranslations()` (server).

- Add the key to **both** locale files before using it
- Group keys logically under existing namespaces or create a new one if needed
- `Common.*` is for shared strings (e.g. close, cancel, save)
- Placeholder text, labels, error messages, tooltips, badges — all must be in locale
<!-- END:i18n-rules -->
