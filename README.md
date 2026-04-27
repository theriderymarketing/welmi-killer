# Welmi Killer

AI-first calorie tracking iOS app. Built 100% on the free tier:

- **Expo (RN)** + NativeWind + Skia + Reanimated 3
- **Local-only** SQLite via Drizzle (no backend, no Supabase)
- **AI** via Welmi Claude proxy (consumes Max plan, marginal €0)
- **Voice** on-device Apple Speech (`expo-speech-recognition`)
- **Fitness** via OAuth: Strava, COROS, Oura (more coming)
  - Apple Watch + Garmin captured automatically through Strava sync
- **Distribution** via AltStore / SideStore + GitHub Releases
- **Hot prompt updates** from `welmi-killer-data` GitHub repo

## Quick start

```bash
cp .env.example .env       # fill Strava/COROS/Oura/proxy credentials
npm install
npx expo run:ios           # dev build (sideload-compatible)
```

## Architecture

```
┌─ App (Expo iOS) ────────────────┐
│  expo-router, NativeWind        │
│  TanStack Query + Zustand       │
│  expo-sqlite + Drizzle          │
└──┬──────────────┬──────────────┘
   │ HTTPS        │ OAuth direct
   ▼              ▼
┌─ Welmi Proxy ─┐ ┌─ Strava / COROS / Oura ─┐
│ Claude Sonnet │ │ user-side OAuth tokens   │
└───────────────┘ └──────────────────────────┘

┌─ welmi-killer-data (public GitHub) ─┐
│  prompts/v1.json  (hot-updateable)  │
│  db/foods.json    (slim USDA)       │
│  altstore/apps.json (manifest)      │
└──────────────────────────────────────┘
```

## File map (high-signal entry points)

- `app/_layout.tsx` — root, QueryClient, DB init, onboarding gate
- `app/(tabs)/index.tsx` — Today dashboard
- `app/log/{camera,voice,manual}.tsx` — logging flows
- `src/components/dashboard/MacroTracker.tsx` — main ring + bars + actions
- `src/lib/ai/foodAnalysis.ts` — vision + voice analysis pipelines
- `src/lib/fitness/{oauth,aggregator}.ts` — generic OAuth + dedupe logic
- `src/lib/fitness/providers/*.ts` — one file per provider
- `src/lib/nutrition/{bmr,tdee,adjustedTargets}.ts` — Mifflin-St Jeor + macro split
- `src/db/schema.ts` — Drizzle SQLite schema

## Sideload

1. Build IPA: tag a release `git tag v0.1.0 && git push --tags`
2. CI builds via EAS, uploads IPA to Releases, bumps `welmi-killer-data/altstore/apps.json`
3. On iPhone, open AltStore/SideStore → Sources → Add `https://theriderymarketing.github.io/welmi-killer-data/altstore/apps.json`
4. Install Welmi Killer

## Roadmap

- 7-screen swipeable onboarding (current = single screen)
- Stats charts (7d/30d/90d)
- Manual entry form with USDA autocomplete
- Whoop, Withings, Polar providers
- Encrypted Gist backup (cross-device sync)
- Local notif for meal reminders
- TFLite Food-101 offline classifier fallback
