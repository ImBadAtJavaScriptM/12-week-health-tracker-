# 12 Week Health Tracker

Private, local-only Progressive Web App for the 12-week plan beginning September 14, 2026.

## What is included

- Today tab with AM + PM check-ins
- Exact 12-week phase schedule
- Phase 1 Zone 2 30–40 min ×4/week + strength ×3/week
- Phase 2–3 Zone 2 45–50 min ×4–5/week + HIIT 8 × 30 sec hard / 90 sec easy ×1/week + strength ×3/week
- Pelvic-floor wellness routine tracked as 0/3–3/3 with phase-specific reference details
- Sleep 7–9 h + wake consistency
- Weight, waist, cardio, strength, energy/stress and optional private health metrics
- 1.6 g/kg protein calculation in Phase 2+
- Grooming / nutrition / optional supplement references
- Progress charts
- JSON backup / restore
- IndexedDB local storage
- Offline service worker + installable PWA manifest
- No analytics, cloud database, account, ads, or remote dependencies

## Run locally on a computer

From this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## iPhone Add to Home Screen

Open the deployed HTTPS URL in Safari, then Share → Add to Home Screen.

Once the PWA has loaded successfully, its app shell is cached for offline use. Tracker data stays in that browser/PWA's local IndexedDB.
