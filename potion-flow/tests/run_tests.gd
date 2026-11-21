extends SceneTree
## Headless unit tests for the puzzle core, levels and save system.
##
##   godot --headless --path . -s res://tests/run_tests.gd
##
## Exits with code 0 when every test passes, 1 otherwise.

const SAVE_SCRIPT := preload("res://scripts/autoload/save_manager.gd")
const ECON_SCRIPT := preload("res://scripts/autoload/economy_manager.gd")

var _passed := 0
var _failed := 0
var _current := ""


func _initialize() -> void:
	var tests := [
		"test_valid_pour", "test_invalid_pour_color_mismatch", "test_pour_into_empty",
		"test_pour_into_full", "test_partial_capacity", "test_multi_unit_pour",
		"test_empty_source", "test_same_bottle", "test_undo", "test_restart_restores_level",
		"test_completion", "test_bottle_complete", "test_key_is_order_independent",
		"test_solver_solves_and_moves_are_legal", "test_solver_detects_unsolvable",
		"test_hint_is_legal_and_progresses", "test_hint_stuck",
		"test_all_shipped_levels", "test_generator_deterministic_and_solvable",
		"test_difficulty_increases", "test_level_data_roundtrip", "test_save_load",
		"test_save_corrupt_file", "test_stars",
	]
	for t in tests:
		_current = t
		call(t)
	print("\n%d passed, %d failed" % [_passed, _failed])
	quit(1 if _failed > 0 else 0)


func check(cond: bool, msg: String) -> void:
	if cond:
		_passed += 1
	else:
		_failed += 1
		printerr("FAIL [%s] %s" % [_current, msg])


func b(arr: Array) -> BoardState:
	return BoardState.new(arr, 4)


# --- Pour rules ------------------------------------------------------------
func test_valid_pour() -> void:
	var s := b([["red", "blue"], ["green", "blue"], []])
	check(s.can_pour(0, 1), "matching top colours can pour")
	check(s.pour(0, 1) == 1, "one unit moved")
	check(s.bottles[0] == ["red"], "source lost its top")
	check(s.bottles[1] == ["green", "blue", "blue"], "target gained the unit")


func test_invalid_pour_color_mismatch() -> void:
	var s := b([["red"], ["blue"]])
	check(not s.can_pour(0, 1), "different colours cannot mix")
	check(s.pour(0, 1) == 0, "illegal pour moves nothing")
	check(s.bottles == [["red"], ["blue"]], "state unchanged after illegal pour")


func test_pour_into_empty() -> void:
	var s := b([["red", "blue", "blue"], []])
	check(s.can_pour(0, 1), "anything can pour into an empty bottle")
	check(s.pour(0, 1) == 2, "whole top run moves into empty bottle")
	check(s.bottles[1] == ["blue", "blue"], "empty bottle received run")


func test_pour_into_full() -> void:
	var s := b([["red"], ["red", "red", "red", "red"]])
	check(not s.can_pour(0, 1), "cannot pour into a full bottle")


func test_partial_capacity() -> void:
	var s := b([["red", "blue", "blue", "blue"], ["green", "green", "blue"]])
	check(s.pour_amount(0, 1) == 1, "limited by free space")
	s.pour(0, 1)
	check(s.bottles[0] == ["red", "blue", "blue"], "remainder stays in source")
	check(s.fill(1) == 4, "target is now full")


func test_multi_unit_pour() -> void:
	var s := b([["red", "red", "red"], ["red"]])
	check(s.pour(0, 1) == 3, "moves every consecutive same-colour unit")
	check(s.is_bottle_complete(1), "target completed")


func test_empty_source() -> void:
	var s := b([[], ["red"]])
	check(not s.can_pour(0, 1), "empty source cannot pour")


func test_same_bottle() -> void:
	var s := b([["red"], []])
	check(not s.can_pour(0, 0), "cannot pour a bottle into itself")
	check(not s.can_pour(0, 5), "out-of-range index rejected")


# --- Undo / restart ----------------------------------------------------------
func test_undo() -> void:
	var s := b([["red", "blue", "blue"], ["blue"], []])
	var before := s.to_array()
	var n := s.pour(0, 1)
	check(s.unpour(0, 1, n), "unpour succeeds")
	check(s.to_array() == before, "undo restores exact state")
	check(not s.unpour(0, 1, 9), "cannot unpour more than the bottle holds")


func test_restart_restores_level() -> void:
	var data := LevelData.from_dict({"level": 1, "bottle_capacity": 4, "colors": ["red", "blue"],
		"bottles": [["red", "blue", "red", "blue"], ["blue", "red", "blue", "red"], [], []]})
	var s := data.create_board()
	s.pour(0, 2)
	s.add_empty_bottle()
	var fresh := data.create_board()
	check(fresh.bottle_count() == 4 and fresh.bottles[0].size() == 4, "level data not mutated by play")


# --- Completion --------------------------------------------------------------
func test_completion() -> void:
	check(b([["red", "red", "red", "red"], [], ["blue", "blue", "blue", "blue"]]).is_solved(), "sorted board is solved")
	check(not b([["red", "red", "red"], ["red"]]).is_solved(), "split colour is not solved")
	check(not b([["red", "red", "red", "blue"], ["blue", "blue", "blue", "red"]]).is_solved(), "mixed is not solved")


func test_bottle_complete() -> void:
	var s := b([["red", "red", "red", "red"], ["red", "red", "red"]])
	check(s.is_bottle_complete(0), "four same = complete")
	check(not s.is_bottle_complete(1), "three same = not complete")


func test_key_is_order_independent() -> void:
	check(b([["red"], ["blue"]]).key() == b([["blue"], ["red"]]).key(), "bottle order ignored in key")


# --- Solver / hints ------------------------------------------------------------
func _replay(s: BoardState, moves: Array) -> bool:
	var c := s.clone()
	for mv in moves:
		if not c.can_pour(mv.x, mv.y):
			return false
		c.pour(mv.x, mv.y)
	return c.is_solved()


func test_solver_solves_and_moves_are_legal() -> void:
	var s := b([["red", "blue", "red", "blue"], ["blue", "red", "blue", "red"], [], []])
	var r := Solver.solve(s)
	check(r["status"] == Solver.STATUS_SOLVED, "solvable board solved")
	check(_replay(s, r["moves"]), "solution replays legally to a solved board")


func test_solver_detects_unsolvable() -> void:
	# Two full mixed bottles and nowhere to pour.
	var s := b([["red", "blue", "red", "blue"], ["blue", "red", "blue", "red"]])
	check(Solver.solve(s)["status"] == Solver.STATUS_UNSOLVABLE, "dead board reported unsolvable")


func test_hint_is_legal_and_progresses() -> void:
	var data := LevelData.load_level_file(12)
	var s := data.create_board()
	var steps := 0
	while not s.is_solved() and steps < 200:
		var h := Solver.hint(s)
		var mv: Vector2i = h["move"]
		check(h["kind"] != "stuck" and s.can_pour(mv.x, mv.y), "hint is a legal move (step %d)" % steps)
		if not s.can_pour(mv.x, mv.y):
			return
		s.pour(mv.x, mv.y)
		steps += 1
	check(s.is_solved(), "following hints solves the level")


func test_hint_stuck() -> void:
	var s := b([["red", "blue", "red", "blue"], ["blue", "red", "blue", "red"]])
	check(Solver.hint(s)["kind"] == "stuck", "no hint on a dead board")


# --- Levels ------------------------------------------------------------------------
func test_all_shipped_levels() -> void:
	var count := 0
	for n in range(1, 1000):
		var data := LevelData.load_level_file(n)
		if data == null:
			break
		count += 1
		check(data.validate().is_empty(), "level %d structurally valid" % n)
		var s := data.create_board()
		check(not s.is_solved(), "level %d does not start solved" % n)
		if n <= 40 or n % 10 == 0:  # full solver pass on a representative subset
			var r := Solver.solve(s, 200000)
			check(r["status"] == Solver.STATUS_SOLVED, "level %d solvable (%s)" % [n, r["status"]])
	check(count >= 10, "at least 10 levels shipped (found %d)" % count)


func test_generator_deterministic_and_solvable() -> void:
	for n in [151, 180, 260]:
		var a := LevelGenerator.generate(n)
		var c := LevelGenerator.generate(n)
		check(a.bottles == c.bottles, "level %d generation is deterministic" % n)
		check(a.validate().is_empty(), "generated level %d valid" % n)
		check(Solver.solve(a.create_board(), 200000)["status"] == Solver.STATUS_SOLVED, "generated level %d solvable" % n)


func test_difficulty_increases() -> void:
	var last := 0
	for n in [1, 11, 31, 76, 151, 400]:
		var c: int = LevelGenerator.difficulty_for(n)["colors"]
		check(c >= last, "colour count never drops (level %d)" % n)
		last = c


func test_level_data_roundtrip() -> void:
	var d := LevelData.load_level_file(5)
	var again := LevelData.from_dict(JSON.parse_string(JSON.stringify(d.to_dict())))
	check(again.bottles == d.bottles and again.capacity == d.capacity, "LevelData survives JSON round trip")


# --- Save system ---------------------------------------------------------------------
func _fresh_save(path: String) -> Variant:
	var sm = SAVE_SCRIPT.new()
	sm.save_path = path
	if FileAccess.file_exists(path):
		DirAccess.remove_absolute(path)
	sm.load_game()
	return sm


func test_save_load() -> void:
	var path := "user://test_save_roundtrip.json"
	var sm = _fresh_save(path)
	sm.set_value("progress", "current_level", 42)
	sm.set_value("economy", "coins", 777)
	sm.set_value("cosmetics", "owned_skins", ["classic", "crystal"])
	var sm2 = _fresh_save_keep(path)
	check(int(sm2.get_value("progress", "current_level")) == 42, "level persisted")
	check(int(sm2.get_value("economy", "coins")) == 777, "coins persisted")
	check((sm2.get_value("cosmetics", "owned_skins") as Array).has("crystal"), "unlocks persisted")
	check(sm2.get_value("settings", "music_volume") != null, "new default keys present after load")
	sm.free()
	sm2.free()
	DirAccess.remove_absolute(path)


func _fresh_save_keep(path: String) -> Variant:
	var sm = SAVE_SCRIPT.new()
	sm.save_path = path
	sm.load_game()
	return sm


func test_save_corrupt_file() -> void:
	var path := "user://test_save_corrupt.json"
	var f := FileAccess.open(path, FileAccess.WRITE)
	f.store_string("{ not json")
	f.close()
	var sm = _fresh_save_keep(path)
	check(int(sm.get_value("progress", "current_level")) == 1, "corrupt save falls back to defaults")
	sm.free()
	DirAccess.remove_absolute(path)


func test_stars() -> void:
	check(ECON_SCRIPT.stars_for(10, 10) == 3, "par = 3 stars")
	check(ECON_SCRIPT.stars_for(16, 10) == 2, "a few over par = 2 stars")
	check(ECON_SCRIPT.stars_for(40, 10) == 1, "far over par = 1 star")
	check(ECON_SCRIPT.level_reward(3, true, 1) > ECON_SCRIPT.level_reward(3, false, 1), "first clear pays more")
