# Rethink

A pause before you spend. Friction-injection for impulsive purchases — One Sec, but for shopping.

This repo is a pnpm monorepo. The original marketing mockup at `/index.html` still ships as the static landing page on Vercel; the real product lives under `apps/` and `packages/`.

## Layout

```
rethink-app/
├── index.html                 # static marketing landing (legacy mockup)
├── apps/
│   └── extension/             # WXT browser extension (Chrome MV3 + Firefox)
├── packages/
│   ├── shared/                # design tokens, types, i18n, archetype defs, rule-based insights
│   └── friction-screen/       # the React friction overlay component, reused everywhere
└── supabase/                  # (Phase 1) migrations, edge functions
```

## Phase 0 — browser extension

The extension intercepts clicks on "Buy Now"/"Place Order" buttons on supported retailers (Amazon, AliExpress, Shein, KSP, Terminal X) plus a generic text-pattern fallback for any other checkout. It mounts the friction screen inside a closed Shadow DOM so retailer CSP doesn't block it, runs a countdown sized by archetype + price, and persists wishlist + decision log + XP locally in `chrome.storage.local`.

### Develop

```bash
pnpm install
pnpm ext:dev            # opens Chrome with the extension loaded, HMR
```

### Build

```bash
pnpm ext:build           # Chrome MV3 -> apps/extension/.output/chrome-mv3
pnpm ext:build:firefox   # Firefox MV2 -> apps/extension/.output/firefox-mv2
pnpm ext:zip             # zipped Chrome package
```

### Load unpacked

1. `pnpm ext:build`
2. Chrome → Extensions → Developer mode → Load unpacked → select `apps/extension/.output/chrome-mv3`
3. Click the Rethink icon → run the 4-question onboarding
4. Visit `amazon.com`, `aliexpress.com`, or any shopping site → click a Buy button → the friction screen mounts in Shadow DOM with countdown + AI insight + Save / Cancel / Buy

## Roadmap

- Phase 0 ✅ — browser extension feasibility proof
- Phase 1 — Supabase backend, Next.js PWA dashboard, magic-link auth, manual "rethink this purchase" form, Lottie mascot
- Phase 2 — 24-hour wishlist reminder via pg_cron + Web Push
- Phase 3 — Capacitor iOS wrap + iOS Shortcuts pack + Safari Web Extension
- Phase 4 — Open Banking integration, Android Accessibility Service, A/B framework

See `/root/.claude/plans/snoopy-marinating-shannon.md` for the full plan.
