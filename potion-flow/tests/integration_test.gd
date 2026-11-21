extends Node
## End-to-end test that drives the real Game scene like a player would.
##
##   godot --headless --path . res://tests/IntegrationTest.tscn
##
## Uses a throwaway save file, plays levels 1-3 with real taps (including the
## pour animations), and checks undo, restart, invalid taps, add-bottle, hints,
## level completion, rewards and persistence. Exit code 0 = pass.

const GAME_SCENE := preload("res://scenes/Game.tscn")

var game: GameController
var _passed := 0
var _failed := 0


func check(cond: bool, msg: String) -> void:
	if cond:
		_passed += 1
	else:
		_failed += 1
		printerr("FAIL ", msg)


func _ready() -> void:
	SaveManager.save_path = "user://integration_test_save.json"
	if FileAccess.file_exists(SaveManager.save_path):
		DirAccess.remove_absolute(SaveManager.save_path)
	SaveManager.load_game()
	await _run()
	DirAccess.remove_absolute(SaveManager.save_path)
	print("\nintegration: %d passed, %d failed" % [_passed, _failed])
	get_tree().quit(1 if _failed > 0 else 0)


func _start(level: int) -> void:
	if game:
		game.queue_free()
		await get_tree().process_frame
	GameManager.pending_level = level
	GameManager.resume_saved = false
	game = GAME_SCENE.instantiate()
	add_child(game)
	await get_tree().process_frame


func _wait_idle(timeout := 5.0) -> void:
	var t := 0.0
	while game.play_state == GameController.PlayState.POURING and t < timeout:
		await get_tree().process_frame
		t += get_process_delta_time()


func _tap_move(from: int, to: int) -> void:
	game.tap_bottle(from)
	game.tap_bottle(to)
	await _wait_idle()


func _check_audio() -> void:
	for id in ["select", "pour", "land", "complete", "level_complete", "coin", "error", "hint"]:
		check(AudioManager._sfx.get(id) is AudioStreamOggVorbis, "sound '%s' loaded from assets" % id)
	var t := 0.0
	while AudioManager._music.stream == null and t < 10.0:
		await get_tree().process_frame
		t += get_process_delta_time()
	var music: AudioStream = AudioManager._music.stream
	check(music is AudioStreamOggVorbis and (music as AudioStreamOggVorbis).loop, "looping ambient music loaded")


func _run() -> void:
	await _check_audio()
	# --- Level 1: tap-select, invalid move, undo, restart, solve -------------
	await _start(1)
	var start: Array = game.board.to_array()
	check(game.views.size() == game.board.bottle_count(), "one view per bottle")
	game.tap_bottle(2)  # empty bottle cannot be selected
	check(game.selected == -1, "empty bottle not selectable")
	game.tap_bottle(0)
	check(game.selected == 0 and game.play_state == GameController.PlayState.SELECTED, "tap selects a bottle")
	game.tap_bottle(0)
	check(game.selected == -1, "second tap deselects")
	game.tap_bottle(0)
	game.tap_bottle(1)  # red onto blue -> illegal
	check(game.board.to_array() == start and game.moves == 0, "illegal pour leaves board untouched")

	await _tap_move(1, 2)
	check(game.moves == 1 and game.board.fill(2) == 1, "legal pour applied")
	check(game.views[2].total_amount() == 1.0, "view matches board after pour")
	game.undo()
	check(game.board.to_array() == start and game.moves == 0, "undo restores the board")
	await _tap_move(1, 2)
	game.restart()
	check(game.board.to_array() == start and game.history.is_empty(), "restart restores the level")

	var coins_before := EconomyManager.coins()
	var data := LevelData.load_level_file(1)
	var solution: Array = _solution_for(1)
	for mv in solution:
		await _tap_move(mv[0], mv[1])
	check(game.board.is_solved(), "level 1 solved via taps")
	check(game.play_state == GameController.PlayState.COMPLETED, "state is LEVEL_COMPLETED")
	check(EconomyManager.coins() > coins_before, "coins awarded")
	check(int(SaveManager.get_value("progress", "current_level")) == 2, "progress advanced")
	check(SaveManager.get_value("progress", "completed").has("1"), "level 1 recorded")
	check(data.par_moves > 0, "level has par")
	# Input is ignored once complete.
	game.tap_bottle(0)
	check(game.selected == -1, "no selection after completion")

	# --- Level 2: hint + add bottle ----------------------------------------------
	await _start(2)
	var tokens := EconomyManager.hint_tokens()
	game.request_hint()
	var t := 0.0
	while game._hint_running and t < 5.0:
		await get_tree().process_frame
		t += get_process_delta_time()
	check(EconomyManager.hint_tokens() == tokens - 1, "hint consumed a token")
	var count := game.board.bottle_count()
	EconomyManager.add_coins(500)
	game.add_bottle()
	check(game.board.bottle_count() == count + 1 and game.views.size() == count + 1, "extra bottle added")
	await get_tree().create_timer(0.5).timeout
	for mv in _solve_now():
		await _tap_move(mv.x, mv.y)
	check(game.board.is_solved(), "level 2 solved with solver moves")

	# --- Persistence: resume mid-level ---------------------------------------------
	await _start(3)
	var first: Vector2i = _solve_now()[0]
	await _tap_move(first.x, first.y)
	var mid: Array = game.board.to_array()
	var saved_path := SaveManager.save_path
	SaveManager.load_game()  # simulate an app restart reading from disk
	check(SaveManager.save_path == saved_path, "same save file")
	GameManager.pending_level = 3
	GameManager.resume_saved = true
	game.queue_free()
	await get_tree().process_frame
	game = GAME_SCENE.instantiate()
	add_child(game)
	await get_tree().process_frame
	check(game.board.to_array() == mid and game.moves == 1, "resumed the saved board")
	game.undo()
	check(game.moves == 0, "undo works after resume")


func _solution_for(level: int) -> Array:
	var f := FileAccess.open(LevelData.FILE_PATTERN % level, FileAccess.READ)
	return JSON.parse_string(f.get_as_text())["solution"]


func _solve_now() -> Array:
	return Solver.solve(game.board)["moves"]
