## Offline Shopping Companion App

A 100% offline, mobile-first app for managing private shopping lists, notes, and ideas. All data stays on the device via `localStorage` — no backend, no Lovable Cloud.

### Design system
- Palette: Blush & Lavender (`#f8e8ee` bg, `#e8c5d0` surface, `#c9a0dc` accent, `#9b72cf` primary). Tokens defined in `src/styles.css` using `oklch`.
- Typography: soft serif display (Instrument Serif) + clean sans body (Work Sans).
- Premium minimal feel: generous spacing, rounded-2xl cards, subtle shadows, soft pastel gradients.
- Mobile-first; stretches gracefully to desktop with a centered max-width container.

### App flow

```text
First launch ──▶ Onboarding (4 slides) ──▶ Lock setup ──▶ Home
Return visit ──▶ Lock screen ──▶ Home
```

### Routes (TanStack Start)
- `/` — gatekeeper: redirects to onboarding, lock setup, lock screen, or home based on local state
- `/onboarding` — 4 slides:
  1. Welcome + nickname input
  2. "Capture every idea" (notes feature)
  3. "Stays on your phone" (offline + privacy)
  4. "Lock it your way" (security setup CTA)
- `/setup-lock` — choose Password / PIN / Pattern + confirmation + irreversible-loss warning
- `/lock` — unlock screen using the chosen method
- `/app` — main shell (logo header, bottom nav, `<Outlet />`)
  - `/app/lists` — shopping lists (create, items with check-off, delete)
  - `/app/notes` — personal notes (create, edit, 3-dots menu → delete)
  - `/app/settings` — change lock, reset app, edit nickname

The header shows the **logo only** (no nickname), per the request.

### Features
1. **Onboarding** — first-run only; nickname saved to localStorage.
2. **App lock (offline)** — PIN (4–6 digits), Password (text), or Pattern (3×3 dot grid). Stored as a SHA-256 hash (via Web Crypto) in localStorage with a salt. Clear warning: "If you forget it, your data cannot be recovered."
3. **Shopping lists** — multiple named lists, add/check/remove items, swipe or 3-dots to delete.
4. **Personal notes** — title + body, timestamp, 3-dots menu with permanent delete (with confirm).
5. **Auto-lock** — re-prompts unlock on tab refocus after 2 min idle.

### Technical details
- Storage helpers in `src/lib/storage.ts` wrapping `localStorage` with JSON + typed keys (`nickname`, `lockConfig`, `lists`, `notes`, `onboarded`).
- Crypto helper in `src/lib/crypto.ts` using `crypto.subtle.digest` for hashing lock secrets.
- Auth/lock state via a small Zustand store or React context (`src/context/AppLockContext.tsx`).
- Route guards in each `_authenticated`-style layout (`src/routes/app.tsx`) redirect to `/lock` if locked.
- shadcn components: Button, Input, Card, Dialog, DropdownMenu (3-dots), Sheet (mobile nav).
- No Lovable Cloud, no server functions, no Netlify config — Lovable hosting handles refresh/deep-link routing automatically.

### Files to create
- `src/styles.css` — replace tokens with Blush & Lavender palette + font imports
- `src/routes/index.tsx` — gatekeeper redirect
- `src/routes/onboarding.tsx` — 4-slide flow with progress dots
- `src/routes/setup-lock.tsx` — method picker + setup
- `src/routes/lock.tsx` — unlock screen
- `src/routes/app.tsx` — authenticated layout with logo + bottom nav
- `src/routes/app.index.tsx` — redirect to `/app/lists`
- `src/routes/app.lists.tsx`, `src/routes/app.notes.tsx`, `src/routes/app.settings.tsx`
- `src/components/PatternLock.tsx`, `src/components/PinPad.tsx`, `src/components/NoteCard.tsx`, `src/components/ListItem.tsx`, `src/components/BottomNav.tsx`, `src/components/AppLogo.tsx`
- `src/lib/storage.ts`, `src/lib/crypto.ts`
- `src/context/AppLockContext.tsx`
- Generated logo image in `src/assets/logo.png`

### Out of scope (per your answers)
- Public marketing pages (hero/features/about/footer)
- Netlify `_redirects` / `netlify.toml` (not applicable — Lovable hosting handles SPA routing)
- GitHub auto-sync (you can connect GitHub yourself via the + menu if desired)

### Notes
- Once built and published on Lovable, the URL works perfectly for PWABuilder/Median APK packaging — no 404s on refresh.
- Forgotten lock = full data loss by design (no recovery possible offline).