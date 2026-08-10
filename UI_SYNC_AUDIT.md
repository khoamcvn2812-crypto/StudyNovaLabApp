# Chinese → IELTS UI parity audit

This transfer keeps the IELTS application as the implementation source of truth for behavior and data. The Chinese repository is a visual reference only; no repository histories are merged.

| Chinese UI pattern | IELTS counterpart | Existing hook(s) preserved | Behavior that remains owned by IELTS | Transfer scope |
|---|---|---|---|---|
| Responsive application shell | `#app`, `.topbar`, `.sn-primary-nav` | `goTo()`, `toggleLang()`, `toggleTheme()` | Page routing, locale and theme persistence | Layout/tokens only |
| Sticky desktop sidebar | `#app` grid + `.sn-primary-nav` desktop mode | `data-pages`, existing `onclick` handlers | Navigation targets | Two-column grid, sticky sidebar and semantic group labels |
| Compact mobile bottom bar | `.sn-primary-nav` mobile mode | `snOpenAddSheet()`, `goTo()` | Five-item navigation and add flow | CSS only |
| Home hero and daily target | `.sn-home-hero`, `#sn-home-goal-ring` | `novaV8StartToday()`, `goTo('dash')` | Goal calculation and recommended activity | HTML/CSS retained; visual shell aligned |
| Priority card | `.sn-home-priority` | `#sn-today-v8-*` | IELTS recommendation selection | CSS only |
| Four statistics | `.sn-home-stats` | `#sn-d-*`, `goTo()` | Streak, review, test and vocabulary totals | CSS only |
| Learning Center | `#page-learn`, `.sn-learn-card` | Existing `goTo()`/AI handlers | IELTS learning tools and data | CSS only |
| Add action sheet | `#sn-add-overlay` | `snChooseAdd()`, `[data-sheet-close]` | Word, bulk, image, essay and mistake flows | CSS only |
| Authentication modal | `#sn-auth-modal` | `snOpenAuth()` and shared auth module IDs | Supabase auth/session/username | No logic changes |
| Writing workspace | `studynova_writing_vault.html` | `goTo()`, `snOpenAuth()`, `wv*` handlers | Drafts, autosave and Mistake Bank schema | Existing shared visual system retained |
| PWA update flow | `service-worker.js` | `SKIP_WAITING`, update banner handlers | Data remains untouched; shell caches refresh | Cache version only |

## Guardrails

- No Supabase table, field, account identifier, storage key, IndexedDB/localStorage schema, or production URL was changed.
- Existing IDs and `data-*` attributes remain intact. Desktop-only navigation entries call existing IELTS handlers and are hidden from the five-item mobile bar.
- IELTS fonts, SVG icons, PWA assets, theme color, and teal/blue/purple palette remain authoritative.


## Desktop overlap correction

The desktop shell uses `#app` as the sole two-column CSS Grid owner. The sidebar is a sticky grid child—not fixed or absolutely positioned—and every main child is constrained to column two with `min-width: 0`. The desktop brand lives in the sidebar while the existing topbar brand remains available below the desktop breakpoint.
