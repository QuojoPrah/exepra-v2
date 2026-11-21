# Potion Flow — Project Checklist

Legend: [x] done · [~] done with placeholder / partial · [ ] not started

## Phase 1 — Foundation
- [x] Godot 4 project, portrait, 720×1280 canvas_items stretch (expand)
- [x] Folder structure (scenes / scripts{core,game,ui,autoload} / levels / assets / tests / tools)
- [x] Autoload services: Save, Audio, Economy, Reward, Level, Game
- [x] App states: HOME, PLAYING, BOTTLE_SELECTED, POURING, PAUSED, LEVEL_COMPLETED, SHOP, SETTINGS

## Phase 2 — Gameplay prototype
- [x] BoardState: capacity, stacks, pour rules (max run, space-limited), completion, win
- [x] Tap to select (lift + glow), tap to pour, invalid-move shake + sound
- [x] Undo (exact reversal), Restart (confirmation only if paid bottles would be lost)
- [x] Hint (solver-backed, off-thread, never suggests a dead end; "stuck" message)
- [x] Add Bottle (coins, max 2 per level)
- [x] Level completion: stars, coins, next / replay / home
- [x] 150 JSON levels, all solver-verified (requirement: ≥10)

## Phase 3 — Visual polish
- [x] Procedural glass bottle: rim, lip, reflections, shading, shadow, glow
- [x] Three silhouettes: classic, crystal (chamfered), ancient (tapered + rune band)
- [x] Volume-correct liquid at any tilt, wavy surface, meniscus, layer seams, bubbles
- [x] Pour: lift → tilt to the lip → stream → pivot while draining → splash → return
- [x] Completion: glow + cork drops in + sparkles; win confetti
- [x] Animated background (gradient, twinkling stars, drifting motes)

## Phase 4 — Main menu
- [x] Logo, Play, Continue, level + rank, coins, daily, shop, collection, settings
- [x] Floating bottles + animated emblem

## Phase 5 — Progression
- [x] Difficulty tiers (tutorial 1-10, easy 11-30, medium 31-75, hard 76-150, advanced 151+)
- [x] Seeded runtime generator beyond level 150 (+ background prefetch)
- [x] Coins: level clear, replays, 25-level milestones, daily rewards
- [x] Mechanics hook (`LevelData.mechanics`); no special mechanics enabled yet

## Phase 6 — Persistence
- [x] Versioned atomic JSON save with migration hook and corruption fallback
- [x] Progress, completed levels + stars, coins, hint tokens, cosmetics, settings, daily streak
- [x] Mid-level resume (Continue) with tamper check
- [x] Daily reward: local calendar day, streaks, clock-rollback guard
- [ ] Server-time validation / cloud save (structure ready)

## Phase 7 — Polish
- [~] Sound: full SFX set + ambient loop, all **procedural placeholders** (drop-in replaceable)
- [x] Music / SFX volume + mute, vibration toggle (haptics on mobile)
- [x] Button squash/overshoot, modal pop-in, fades between screens, toasts
- [x] Reduced-effects mode (stops idle redraws, fewer particles)
- [x] Safe-area (notch) margins
- [ ] Localisation (language picker present, English only)
- [ ] Profile on a low-end Android device

## Phase 8 — Release prep
- [x] App icon (1024/512/192), Android adaptive icon layers, splash
- [x] Android + iOS export presets
- [~] Privacy policy / terms: **placeholder text**
- [~] Store screenshots (draft captures in docs/screenshots) · [ ] signing keys, real package id
- [ ] Monetisation (intentionally none; economy is balanced for free play)

## Verification status
- [x] All GDScript parses and lints clean (gdtoolkit 4.5)
- [x] Python reference tests: 167 passing (rules, solver vs brute force, all 150 levels)
- [x] Godot 4.3: unit tests 417/417, integration 22/22 (real taps through the Game scene)
- [x] Rendered on the Vulkan Mobile renderer; screenshots in `docs/screenshots/`
