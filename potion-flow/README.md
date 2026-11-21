# Potion Flow

A mobile-first magical liquid-sorting puzzle game built with **Godot 4.3+ / GDScript**
(portrait, 720×1280 design resolution, stretches to any phone or tablet).

Tap a bottle to lift it, tap another to pour. The top run of a colour pours
across, up to the space available, and only onto the same colour or into an
empty bottle. Fill every bottle with a single potion to brew the level.

## Run it

1. Install Godot **4.3 or newer** (standard build, not .NET).
2. Open `potion-flow/project.godot` in the editor (the first open imports fonts and icons).
3. Press **F5**. The window opens at phone proportions; mouse clicks act as taps.

## Tests

```bash
# Puzzle core, solver, levels, save system (headless)
godot --headless --path potion-flow --import          # first time only
godot --headless --path potion-flow -s res://tests/run_tests.gd

# End-to-end: plays levels through the real Game scene with taps, undo,
# restart, hints, extra bottles, completion rewards and save/resume
godot --headless --path potion-flow res://tests/IntegrationTest.tscn

# Reference rules + every shipped level proven solvable (no Godot needed)
cd potion-flow/tools && python3 -m pytest test_level_tool.py -q
python3 level_tool.py verify
```

## Project layout

```
potion-flow/
├── project.godot            portrait, mobile renderer, autoloads
├── export_presets.cfg       Android + iOS presets (icons, package ids)
├── scenes/                  MainMenu, Game, Bottle, LevelComplete, Settings, Shop, DailyReward
├── scripts/
│   ├── core/                pure logic, no nodes, unit-tested
│   │   ├── board_state.gd   bottles + pour/undo rules + win detection
│   │   ├── solver.gd        memoised DFS: hints + solvability proofs
│   │   ├── level_data.gd    level model + JSON loading/validation
│   │   ├── level_generator.gd  seeded generator for levels beyond the shipped files
│   │   ├── potion_colors.gd    10-colour palette
│   │   └── cosmetics.gd     bottle skins + background themes catalogue
│   ├── game/                rendering + gameplay
│   │   ├── bottle_shape.gd  procedural silhouettes (classic / crystal / ancient)
│   │   ├── bottle_view.gd   glass, volume-correct liquid, glow, cork, bubbles
│   │   ├── pour_stream.gd   the falling liquid ribbon
│   │   ├── particle_layer.gd  splashes, sparkles, confetti (CPU, capped)
│   │   └── game_controller.gd state machine, input, pour, undo, hint, add bottle, win
│   ├── ui/                  HUD, menus, overlays, procedural icons, UI kit
│   └── autoload/            SaveManager, AudioManager, EconomyManager,
│                            RewardManager, LevelManager, GameManager
├── levels/level_001..150.json   generated + solver-verified
├── assets/fonts/            Lilita One, Cinzel Decorative (SIL OFL, licences included)
├── assets/branding/         app icon, adaptive icon layers, splash
├── tests/                   GDScript unit + integration tests
└── tools/                   level generator/verifier, branding renderer (Python)
```

## How things work

* **Rules live in `BoardState`.** The scene layer never changes puzzle state
  itself. The controller applies a move to the board first, then animates the
  views to match. Input is ignored while a pour animates, so pours can never
  overlap or corrupt the board.
* **Liquid rendering.** Each layer is a level band clipped to the glass interior with
  `Geometry2D.intersect_polygons`. Layer heights come from a binary search on the
  clipped area, so volumes stay correct at any tilt. The pour angle is solved so
  the surface sits exactly at the lip, and the bottle pivots around its mouth as
  it drains. This works on every renderer (no `clip_children` needed).
* **Levels.** `tools/level_tool.py generate --count N` writes `levels/level_NNN.json`.
  Tutorial and easy levels are built by walking *backwards* from the solved
  state with inverse legal pours. Later levels are shuffled. Every level is
  proven solvable, and its `par_moves` is the BFS optimum where that is
  tractable. Beyond the shipped files, `LevelGenerator` creates seeded levels,
  verified by the same solver and pre-generated on a worker thread.
* **Saves.** `user://potion_flow_save.json` is versioned and written atomically,
  with a `migrate()` hook. It is grouped into sections (`progress`, `economy`,
  `cosmetics`, `settings`, `daily`) so it can sync to a cloud save as-is.
* **Audio.** Every sound is a procedurally synthesised **placeholder**. Drop
  `res://assets/audio/sfx/<id>.ogg` (ids: select, deselect, move, pour, land,
  complete, click, level_complete, coin, error, hint, unlock) or
  `res://assets/audio/music/ambient.ogg` and it replaces the placeholder automatically.

## Adding a special mechanic

`LevelData.mechanics` is a free-form dictionary carried from the JSON. To add,
say, locked bottles:
1. Store `"mechanics": {"locked": [3]}` in the level.
2. Extend `BoardState.can_pour`.
3. Extend `Solver.ordered_moves` (the solver uses `can_pour`).
4. Draw it in `BottleView`.

Nothing else needs to change.

## Before publishing

* Replace the placeholder legal copy in `scripts/ui/legal_text.gd`.
* Replace the placeholder sounds (see above).
* Set your own `package/unique_name` / `bundle_identifier` (currently
  `com.potionflow.game`) and your signing keys in `export_presets.cfg`.
* Android export needs the Godot export templates and a debug/release keystore.
