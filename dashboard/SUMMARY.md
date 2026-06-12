# ARCANE Dashboard — Self-Healing Pipeline Tracker

## Goal
Improve self-healing pipeline metrics toward near-perfect by fixing garbage-selector false positives, balancing typo vs ML strategy, and enhancing Angular dashboard (auto-refresh, pagination, filters).

## Constraints & Preferences
- False positives (healing non-existent element) are worse than false negatives.
- typo strategy dominates (100% recall, ~95% precision); ML recall is 0% — ML is fallback only.
- Speed matters: mean heal time ~25-30s is too slow for real-time testing.
- Dashboard must update automatically with each new heal without manual page reload.

## Progress
### Done
- **CORS fix deployed**: single `CORS(app, origins=["http://localhost:4200"])` line; verified `Access-Control-Allow-Origin` header present in all responses.
- **Garbage selector fix deployed**: threshold lowered `>=2` → `>=1`; early return added to `/heal` route (returns `failed` in <0.01s instead of running full pipeline).
- **Analytics 500 fix deployed**: `conn.execute("...WHERE status=?", "healed")` → `conn.execute("...WHERE status=?", ["healed"])` (tuple/list instead of bare string).
- **`use_typo` ratio**: `ml_confidence * 1.2` (typo must beat ML by 20%).
- **Angular auto-refresh added**: polling interval default 2000ms; history page now uses `getHistoryStream()` (polling `/history?limit=500` every 4s); dashboard polls `/dashboard-data` every 2s; analytics polls `/analytics` every 6s.
- **History pagination + filters added**: filter bar (status: All/Healed/Failed, strategy: All/Typo/ML), pagination controls (Prev/Next + page numbers, 15 per page), client-side filtering on fetched runs.
- **Semantic/Contextual/TF-IDF 1.000 fix**: `normalize_scores` min-max normalization was making best score always 1.0. Fixed by storing pre-normalization raw scores in `history["*_raw"]` and using those for dashboard layer display (4 lines changed in notebook).
- Build passes (`ng build` successful).

### In Progress
- (none currently)

### Blocked
- (none currently)

## Key Decisions
- typo strategy (100% recall, ~95% precision) preferred over ML; ML used only when typo fails and selector is not garbage.
- typo/ML ratio threshold at `1.2` ensures typo only wins when it clearly outperforms ML.
- Garbage detection threshold lowered to `>=1` — a single suspicious token marks selector as garbage — because false positives (healing non-existent element) are worse than false negatives.
- Auto-refresh via polling (2s/4s/6s intervals) chosen over SSE/WebSocket for simplicity with Colab Flask API.
- Pagination/filtering done client-side (`limit=500` fetch, slice in component) since total runs per session are small.

## Next Steps
1. **Re-run full eval suite** after user applies remaining fixes in Colab (`npm run eval` from `self-healing-playwright-v2`).
2. **Profile `typo_correct` speed** — ~25-30s per heal; investigate caching browser launch or moving typo logic to local Node.js.
3. **Confirm final metrics** exceed 95% Accuracy / F1.

## Critical Context
- ngrok tunnel (`laney-petaliferous-dully.ngrok-free.dev`) is unstable — drops with Colab runtime disconnect (ERR_NGROK_3200). Full eval run likely times out before finishing all 8 scenarios (~20 min).
- Previous eval (partial data, tunnel died at Wishlist): Page Structure 6/7 (85.7%), Navigation 4/5 (80%), Hero & Banners 2/3 (66.7%), Product Modal 4/4 (100%), Cart 2/2 (100%). All cases after Cart failed (ENOTFOUND).
- The notebook `_is_garbage_selector` with `garbage_count >= 1 + regex abc\d+` correctly catches `#this-nav-element-does-not-exist-abc999` in Python/JS tests, but the running Colab still shows false positives — user needs to re-run cell after applying code changes.

## Relevant Files
- `C:\Users\binitns\Downloads\self_healer_api_v3 (2).ipynb`: Colab notebook locally edited; user copies changes manually into Colab cells.
- `C:\Users\binitns\Downloads\arcane-dashboard-update\src\app\services\dashboard.service.ts`: Central polling service (2s dashboard, 4s history, 6s analytics).
- `C:\Users\binitns\Downloads\arcane-dashboard-update\src\app\pages\history`: History page component (TS + HTML + SCSS) — includes pagination + filters.
- `C:\Users\binitns\Desktop\self-healing-playwright-v2`: Eval project with scenarios, helpers (evaluator.js, healer.js, metrics.js), and `.env.healing` pointing to ngrok URL.
- `C:\Users\binitns\Downloads\heal_db.py` / `heal_db (1).py`: SQLite persistence; identical files with `get_analytics()` method.
