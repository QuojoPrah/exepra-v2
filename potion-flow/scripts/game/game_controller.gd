class_name GameController
extends Node2D
## Gameplay screen: owns the BoardState, drives BottleViews, handles input,
## pouring, undo, restart, hints, extra bottles and level completion.

enum PlayState { IDLE, SELECTED, POURING, COMPLETED, PAUSED }

const BOTTLE_W := 100.0
const BOTTLE_H := BottleShape.HEIGHT + 20.0
const LIFT_SPACE := 50.0
const GAP := 22.0
const ROW_GAP := 40.0
const MAX_SCALE := 1.3

var level_data: LevelData
var board: BoardState
var views: Array[BottleView] = []
var selected := -1
var play_state: PlayState = PlayState.IDLE
var history: Array = []  # [from, to, amount]
var moves := 0
var extra_bottles := 0
var hints_used := 0
var board_version := 0  # bumps on every change; used to drop stale hint results

var _background: MagicBackground
var _board_node: Node2D
var _stream: PourStream
var _particles: ParticleLayer
var _hud: GameHUD
var _overlay_layer: CanvasLayer
var _hint_running := false
var _hint_task := -1
var _tutorial_pending := false
var _skin: Dictionary
var _low_fx := false


func _ready() -> void:
	_skin = Cosmetics.get_skin(SaveManager.get_value("cosmetics", "skin", "classic"))
	_low_fx = bool(SaveManager.get_value("settings", "low_effects", false))
	var bg_layer := CanvasLayer.new()
	bg_layer.layer = -10
	add_child(bg_layer)
	_background = MagicBackground.new()
	bg_layer.add_child(_background)
	_board_node = Node2D.new()
	add_child(_board_node)
	_stream = PourStream.new()
	_stream.z_index = 20
	add_child(_stream)
	_particles = ParticleLayer.new()
	_particles.z_index = 30
	_particles.effect_scale = 0.4 if _low_fx else 1.0
	add_child(_particles)
	var hud_layer := CanvasLayer.new()
	hud_layer.layer = 5
	add_child(hud_layer)
	_hud = GameHUD.new()
	hud_layer.add_child(_hud)
	_overlay_layer = CanvasLayer.new()
	_overlay_layer.layer = 10
	add_child(_overlay_layer)

	_hud.home_pressed.connect(_on_home)
	_hud.settings_pressed.connect(_on_settings)
	_hud.undo_pressed.connect(undo)
	_hud.restart_pressed.connect(_on_restart_pressed)
	_hud.hint_pressed.connect(request_hint)
	_hud.add_bottle_pressed.connect(add_bottle)
	get_viewport().size_changed.connect(_on_viewport_resized)
	SaveManager.changed.connect(_on_save_changed)

	var saved: Dictionary = SaveManager.get_value("progress", "in_progress", {})
	var level := GameManager.pending_level
	if GameManager.resume_saved and int(saved.get("level", -1)) == level:
		start_level(level, saved)
	else:
		start_level(level)
	AudioManager.play_music()


func _exit_tree() -> void:
	if _hint_task >= 0:
		WorkerThreadPool.wait_for_task_completion(_hint_task)
		_hint_task = -1


func _on_viewport_resized() -> void:
	_layout(false)


func _on_save_changed(section_name: String) -> void:
	if section_name == "cosmetics":
		_skin = Cosmetics.get_skin(SaveManager.get_value("cosmetics", "skin", "classic"))
		for v in views:
			v.set_skin(_skin)
	elif section_name == "settings":
		_low_fx = bool(SaveManager.get_value("settings", "low_effects", false))
		_particles.effect_scale = 0.4 if _low_fx else 1.0
		for v in views:
			v.low_effects = _low_fx


# --------------------------------------------------------------------------
# Level lifecycle
# --------------------------------------------------------------------------
func start_level(level: int, restore: Dictionary = {}) -> void:
	level_data = LevelManager.get_level(level)
	board = level_data.create_board()
	history.clear()
	moves = 0
	extra_bottles = 0
	hints_used = 0
	selected = -1
	board_version += 1
	if not restore.is_empty():
		var restored := BoardState.new(restore.get("bottles", []), level_data.capacity)
		if _same_contents(restored, board):
			board = restored
			moves = int(restore.get("moves", 0))
			extra_bottles = int(restore.get("extra", 0))
			for h in restore.get("history", []):
				history.append([int(h[0]), int(h[1]), int(h[2])])
	_rebuild_views()
	_hud.set_level(level, level_data.tier)
	_hud.set_tutorial(level_data.tutorial)
	_tutorial_pending = level == 1 and moves == 0
	_layout(false)
	_refresh_hud()
	_set_state(PlayState.IDLE)
	LevelManager.prefetch(level + 1)
	if _tutorial_pending:
		_show_tutorial_hint()


## Guards against a corrupted or stale save: same multiset of colours.
func _same_contents(a: BoardState, b: BoardState) -> bool:
	return a.color_counts() == b.color_counts() and a.bottle_count() >= b.bottle_count()


func _rebuild_views() -> void:
	for v in views:
		v.queue_free()
	views.clear()
	for i in range(board.bottle_count()):
		_create_view(i)


func _create_view(i: int) -> BottleView:
	var v := BottleView.new()
	v.index = i
	v.capacity = board.capacity
	v.low_effects = _low_fx
	v.set_skin(_skin)
	v.set_contents(board.bottles[i])
	v.set_complete_instant(board.is_bottle_complete(i))
	_board_node.add_child(v)
	views.append(v)
	return v


func _set_state(s: PlayState) -> void:
	play_state = s
	match s:
		PlayState.IDLE:
			GameManager.set_state(GameManager.AppState.PLAYING)
		PlayState.SELECTED:
			GameManager.set_state(GameManager.AppState.BOTTLE_SELECTED)
		PlayState.POURING:
			GameManager.set_state(GameManager.AppState.POURING)
		PlayState.PAUSED:
			GameManager.set_state(GameManager.AppState.PAUSED)
		PlayState.COMPLETED:
			GameManager.set_state(GameManager.AppState.LEVEL_COMPLETED)


func _refresh_hud() -> void:
	_hud.set_moves(moves, level_data.par_moves)
	var done := 0
	for i in range(board.bottle_count()):
		if board.is_bottle_complete(i):
			done += 1
	_hud.set_progress(done, level_data.colors.size())
	_hud.set_undo_enabled(not history.is_empty())
	_hud.set_add_enabled(extra_bottles < EconomyManager.MAX_EXTRA_BOTTLES)


func _save_progress() -> void:
	var saved := {
		"level": level_data.level,
		"bottles": board.to_array(),
		"moves": moves,
		"extra": extra_bottles,
		"history": history.duplicate(true),
	}
	SaveManager.set_value("progress", "in_progress", saved)


# --------------------------------------------------------------------------
# Layout
# --------------------------------------------------------------------------
func _layout(animate: bool) -> void:
	var vp := get_viewport_rect().size
	var reserved := _hud.reserved()
	var area := Rect2(Vector2(20, reserved.x), Vector2(vp.x - 40, vp.y - reserved.x - reserved.y))
	var n := board.bottle_count()
	var best_rows := 1
	var best_scale := 0.0
	for rows in range(1, 5):
		var per_row := ceili(float(n) / rows)
		var sw := area.size.x / (per_row * BOTTLE_W + (per_row - 1) * GAP)
		var sh := area.size.y / (rows * (BOTTLE_H + LIFT_SPACE) + (rows - 1) * ROW_GAP)
		var s := minf(minf(sw, sh), MAX_SCALE)
		# Prefer fewer rows unless more rows give clearly bigger bottles.
		if s > best_scale * 1.08:
			best_scale = s
			best_rows = rows
	var per := ceili(float(n) / best_rows)
	var s := best_scale
	var cell_h := (BOTTLE_H + LIFT_SPACE) * s
	var block_h := best_rows * cell_h + (best_rows - 1) * ROW_GAP * s
	var top := area.position.y + (area.size.y - block_h) * 0.5
	for i in range(n):
		var row := i / per
		var col := i % per
		var in_row := mini(per, n - row * per)
		var row_w := in_row * BOTTLE_W * s + (in_row - 1) * GAP * s
		var x := vp.x * 0.5 - row_w * 0.5 + (col + 0.5) * BOTTLE_W * s + col * GAP * s
		var y := top + (row + 1) * cell_h + row * ROW_GAP * s
		var v := views[i]
		v.rest_position = Vector2(x, y)
		v.scale = Vector2(s, s)
		var target := v.rest_position + (Vector2(0, -BottleView.LIFT * s) if v.selected else Vector2.ZERO)
		if animate:
			var tw := v.create_tween()
			tw.tween_property(v, "position", target, 0.35).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		else:
			v.position = target


# --------------------------------------------------------------------------
# Input
# --------------------------------------------------------------------------
func _unhandled_input(event: InputEvent) -> void:
	# Mouse events cover desktop clicks and (via emulate_mouse_from_touch) taps
	# on phones; GUI buttons consume theirs before this runs.
	var mb := event as InputEventMouseButton
	if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
		var pos: Vector2 = get_canvas_transform().affine_inverse() * mb.position
		on_tap(pos)
		get_viewport().set_input_as_handled()


func bottle_at(pos: Vector2) -> int:
	for v in views:
		if v.hit_rect().has_point(pos):
			return v.index
	return -1


func on_tap(pos: Vector2) -> void:
	if play_state == PlayState.POURING or play_state == PlayState.COMPLETED \
			or play_state == PlayState.PAUSED:
		return
	tap_bottle(bottle_at(pos))


## Core tap logic, separated from coordinates so tests can drive it.
func tap_bottle(i: int) -> void:
	if play_state == PlayState.POURING or play_state == PlayState.COMPLETED \
			or play_state == PlayState.PAUSED:
		return
	if i < 0:
		if selected >= 0:
			_deselect()
		return
	if selected < 0:
		if board.is_empty(i) or board.is_bottle_complete(i):
			views[i].shake()
			AudioManager.play("error", 1.3, -8.0)
			return
		_select(i)
		return
	if i == selected:
		_deselect()
		return
	if board.can_pour(selected, i):
		_pour(selected, i)
	else:
		views[i].shake()
		AudioManager.play("error")
		AudioManager.vibrate(30)
		_deselect()


func _select(i: int) -> void:
	selected = i
	views[i].set_selected(true)
	views[i].z_index = 5
	AudioManager.play("select")
	AudioManager.vibrate(10)
	_set_state(PlayState.SELECTED)


func _deselect() -> void:
	if selected >= 0 and selected < views.size():
		views[selected].set_selected(false)
		views[selected].z_index = 0
		AudioManager.play("deselect", 1.0, -6.0)
	selected = -1
	_set_state(PlayState.IDLE)


# --------------------------------------------------------------------------
# Pouring
# --------------------------------------------------------------------------
func _pour(from: int, to: int) -> void:
	var color := board.top_color(from)
	var fill_before := board.fill(from)
	var amount := board.pour(from, to)
	if amount <= 0:
		return
	history.append([from, to, amount])
	moves += 1
	board_version += 1
	selected = -1
	_tutorial_pending = false
	_set_state(PlayState.POURING)
	_save_progress()
	_refresh_hud()
	if level_data.level <= 2 and moves == 1:
		_hud.set_tutorial("")
	await _animate_pour(from, to, color, amount, fill_before)
	if not is_inside_tree():
		return
	if board.is_bottle_complete(to):
		views[to].play_complete()
		_particles.sparkle(views[to].to_global(Vector2(0, -120)), PotionColors.get_color(color), 18, 50.0 * views[to].scale.x)
		AudioManager.play("complete")
		AudioManager.vibrate(25)
	if board.is_solved():
		_on_level_solved()
	else:
		_set_state(PlayState.IDLE)


func _animate_pour(from: int, to: int, color_id: String, amount: int, fill_before: int) -> void:
	var src := views[from]
	var dst := views[to]
	var s := src.scale.x
	var color := PotionColors.get_color(color_id)
	src.z_index = 10
	var vp := get_viewport_rect().size
	# Volume-correct angles: the surface sits at the lip as the pour starts,
	# and the bottle keeps tipping as it drains.
	var a_start := src.pour_angle(float(fill_before))
	var a_end := src.pour_angle(float(fill_before - amount))
	var dir := 1.0 if dst.rest_position.x >= src.rest_position.x else -1.0
	var target_mouth := dst.rest_position + Vector2(0, (-BottleShape.HEIGHT - 30.0) * dst.scale.y)
	var pose := func(angle: float) -> Vector2:
		return target_mouth - src.mouth_local().rotated(angle) * s
	# Keep the tilted bottle on screen; pour from the other side if needed.
	var probe: Vector2 = pose.call(dir * a_start)
	if probe.x < 12.0 or probe.x > vp.x - 12.0:
		dir = -dir

	var t_in := 0.26
	var tw := create_tween().set_parallel(true)
	tw.tween_property(src, "position", pose.call(dir * a_start), t_in) \
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	tw.tween_property(src, "rotation", dir * a_start, t_in).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	tw.tween_property(src, "tilt_amount", 1.0, t_in)
	AudioManager.play("move", 1.0, -4.0)
	await tw.finished

	# Flow.
	_stream.start(src.mouth_global(), dst.surface_global(), color)
	var flow_time := 0.2 + 0.12 * amount
	var state := {"poured": 0.0}
	AudioManager.play("pour", randf_range(0.95, 1.08))
	dst.add_bubbles(5 + amount * 2)
	var tw2 := create_tween().set_parallel(true)
	tw2.tween_property(_stream, "width", 10.0 * s, 0.07)
	var flow := func(p: float) -> void:
		# Pivot around the mouth so the stream stays over the target.
		var angle := dir * lerpf(a_start, a_end, p)
		src.rotation = angle
		src.position = pose.call(angle)
		var target := amount * p
		var d: float = target - float(state["poured"])
		state["poured"] = target
		src.adjust_top(color_id, -d)
		dst.adjust_top(color_id, d)
		dst.wobble = 0.8
		_stream.from_point = src.mouth_global()
		_stream.to_point = dst.surface_global()
		if randf() < 0.25:
			_particles.splash(dst.surface_global(), color, 2)
	tw2.tween_method(flow, 0.0, 1.0, flow_time)
	await tw2.finished

	var tw3 := create_tween()
	tw3.tween_property(_stream, "width", 0.0, 0.07)
	await tw3.finished
	_stream.stop()
	# Snap displays to the authoritative state.
	src.set_contents(board.bottles[from])
	dst.set_contents(board.bottles[to])
	_particles.splash(dst.surface_global(), color, 6)

	var tw4 := create_tween().set_parallel(true)
	tw4.tween_property(src, "position", src.rest_position, 0.24).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	tw4.tween_property(src, "rotation", 0.0, 0.24).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw4.tween_property(src, "tilt_amount", 0.0, 0.2)
	AudioManager.play("land", 1.0, -6.0)
	await tw4.finished
	src.selected = false
	src.z_index = 0
	src.wobble = 0.6


# --------------------------------------------------------------------------
# Tools: undo, restart, hint, add bottle
# --------------------------------------------------------------------------
func can_use_tools() -> bool:
	return play_state == PlayState.IDLE or play_state == PlayState.SELECTED


func undo() -> void:
	if not can_use_tools():
		return
	if history.is_empty():
		UIKit.toast(_overlay_layer, "Nothing to undo")
		return
	if selected >= 0:
		_deselect()
	var h: Array = history.pop_back()
	var from: int = h[0]
	var to: int = h[1]
	if not board.unpour(from, to, h[2]):
		push_error("undo failed; board out of sync")
		return
	moves = maxi(0, moves - 1)
	board_version += 1
	for i in [from, to]:
		views[i].set_contents(board.bottles[i])
		views[i].set_complete_instant(board.is_bottle_complete(i))
		views[i].wobble = 1.0
	AudioManager.play("move", 0.8)
	_save_progress()
	_refresh_hud()


func _on_restart_pressed() -> void:
	if not can_use_tools():
		return
	if extra_bottles > 0:
		UIKit.confirm(_overlay_layer, "Restart level?",
			"Your extra bottles will be lost.", "Restart", restart, true)
	else:
		restart()


func restart() -> void:
	if play_state == PlayState.POURING:
		return
	SaveManager.set_value("progress", "in_progress", {})
	start_level(level_data.level)
	for v in views:
		v.wobble = 1.0
	AudioManager.play("move", 1.2)


func request_hint() -> void:
	if not can_use_tools() or _hint_running:
		return
	if EconomyManager.hint_tokens() <= 0 and not EconomyManager.can_afford(EconomyManager.HINT_COST):
		UIKit.toast(_overlay_layer, "Not enough coins for a hint (%d)" % EconomyManager.HINT_COST)
		_hud.pulse_coins()
		return
	_hint_running = true
	var snapshot := board.clone()
	var version := board_version
	# Search off the main thread so the game never stutters.
	_hint_task = WorkerThreadPool.add_task(func() -> void:
		var result := Solver.hint(snapshot)
		_on_hint_ready.call_deferred(result, version)
	)


func _on_hint_ready(result: Dictionary, version: int) -> void:
	_hint_running = false
	if _hint_task >= 0:
		WorkerThreadPool.wait_for_task_completion(_hint_task)
		_hint_task = -1
	if not is_inside_tree():
		return
	if version != board_version:
		request_hint()  # board changed meanwhile; recompute (nothing was charged)
		return
	var mv: Vector2i = result["move"]
	if result["kind"] == "stuck" or mv.x < 0:
		UIKit.toast(_overlay_layer, "No winning moves from here. Try Undo or add a bottle.")
		AudioManager.play("error", 0.8)
		return
	if not EconomyManager.pay_for_hint():
		return
	hints_used += 1
	show_hint_move(mv)


func show_hint_move(mv: Vector2i) -> void:
	if selected >= 0 and selected != mv.x:
		_deselect()
	views[mv.x].flash_hint()
	views[mv.y].flash_hint()
	AudioManager.play("hint")


func _show_tutorial_hint() -> void:
	var r := Solver.hint(board, 2000)
	var mv: Vector2i = r["move"]
	if mv.x >= 0:
		views[mv.x].flash_hint(3.0)
		views[mv.y].flash_hint(3.0)


func add_bottle() -> void:
	if not can_use_tools():
		return
	if extra_bottles >= EconomyManager.MAX_EXTRA_BOTTLES:
		UIKit.toast(_overlay_layer, "You can add at most %d bottles per level" % EconomyManager.MAX_EXTRA_BOTTLES)
		return
	if not EconomyManager.spend(EconomyManager.EXTRA_BOTTLE_COST, "extra_bottle"):
		UIKit.toast(_overlay_layer, "Need %d coins for an extra bottle" % EconomyManager.EXTRA_BOTTLE_COST)
		_hud.pulse_coins()
		return
	if selected >= 0:
		_deselect()
	var i := board.add_empty_bottle()
	extra_bottles += 1
	board_version += 1
	var v := _create_view(i)
	_layout(true)
	v.position = v.rest_position + Vector2(0, 60)
	v.modulate.a = 0.0
	var tw := v.create_tween().set_parallel(true)
	tw.tween_property(v, "modulate:a", 1.0, 0.3)
	tw.tween_property(v, "position", v.rest_position, 0.4).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	_particles.sparkle(v.rest_position + Vector2(0, -120 * v.scale.y), UIKit.CYAN, 16, 50.0)
	AudioManager.play("unlock")
	_save_progress()
	_refresh_hud()


# --------------------------------------------------------------------------
# Completion
# --------------------------------------------------------------------------
func _on_level_solved() -> void:
	_set_state(PlayState.COMPLETED)
	var level := level_data.level
	var stars := EconomyManager.stars_for(moves, level_data.par_moves)
	var completed: Dictionary = SaveManager.get_value("progress", "completed", {})
	var key := str(level)
	var first_time := not completed.has(key)
	var reward := EconomyManager.level_reward(stars, first_time, level)
	var prog := SaveManager.section("progress")
	completed[key] = maxi(stars, int(completed.get(key, 0)))
	prog["completed"] = completed
	prog["in_progress"] = {}
	if first_time:
		prog["levels_completed"] = int(prog.get("levels_completed", 0)) + 1
	if level >= int(prog.get("current_level", 1)):
		prog["current_level"] = level + 1
	prog["highest_unlocked"] = maxi(int(prog.get("highest_unlocked", 1)), level + 1)
	SaveManager.commit("progress")
	var bonus := 0
	if first_time and level % EconomyManager.MILESTONE_EVERY == 0:
		bonus = EconomyManager.MILESTONE_BONUS
	EconomyManager.add_coins(reward + bonus, "level")

	# Celebrate.
	AudioManager.play("level_complete")
	AudioManager.vibrate(40)
	var vp := get_viewport_rect().size
	var palette: Array = []
	for c in level_data.colors:
		palette.append(PotionColors.get_color(c))
	palette.append(UIKit.GOLD)
	for k in range(3):
		_particles.burst(Vector2(vp.x * (0.25 + 0.25 * k), vp.y * 0.42), palette, 50)
	for v in views:
		if not board.is_empty(v.index):
			v.complete_glow = 1.0
	# Bound to this node, so it is dropped if the screen closes first.
	get_tree().create_timer(0.9).timeout.connect(
		_show_complete_overlay.bind(level, stars, reward, bonus))


func _show_complete_overlay(level: int, stars: int, reward: int, bonus: int) -> void:
	var overlay := LevelCompleteOverlay.new()
	overlay.setup(level, stars, reward, bonus, moves, level_data.par_moves)
	overlay.next_pressed.connect(func() -> void:
		GameManager.pending_level = level + 1
		start_level(level + 1)
	)
	overlay.replay_pressed.connect(func() -> void: start_level(level))
	overlay.home_pressed.connect(_on_home)
	_overlay_layer.add_child(overlay)


func _on_home() -> void:
	if play_state == PlayState.POURING:
		return
	GameManager.go_home()


func _on_settings() -> void:
	if play_state == PlayState.POURING or play_state == PlayState.COMPLETED:
		return
	if selected >= 0:
		_deselect()
	_set_state(PlayState.PAUSED)
	var panel := SettingsPanel.new()
	panel.closed.connect(func() -> void: _set_state(PlayState.IDLE))
	_overlay_layer.add_child(panel)
