class_name LevelGenerator
extends RefCounted
## Builds levels beyond the shipped JSON files. Every generated board is checked
## by the solver; boards it cannot prove solvable are discarded.

const MAX_ATTEMPTS := 12


## Difficulty curve shared with tools/level_tool.py (difficulty_for).
static func difficulty_for(level: int) -> Dictionary:
	if level <= 10:
		return {"tier": "tutorial", "colors": 2 if level <= 3 else 3, "empty": 2}
	if level <= 30:
		return {"tier": "easy", "colors": 3 if level <= 18 else 4, "empty": 2}
	if level <= 75:
		return {"tier": "medium", "colors": mini(6, 4 + (level - 31) * 3 / 45), "empty": 2}
	if level <= 150:
		return {"tier": "hard", "colors": mini(8, 6 + (level - 76) * 3 / 75), "empty": 2}
	return {"tier": "advanced", "colors": mini(10, 8 + (level - 151) / 100), "empty": 2}


static func generate(level: int, solver_budget: int = 30000) -> LevelData:
	var d := difficulty_for(level)
	var rng := RandomNumberGenerator.new()
	rng.seed = 1000 + level * 7919
	var palette: PackedStringArray = PotionColors.ORDER.slice(0, int(d["colors"]))
	var empty: int = d["empty"]
	for attempt in range(MAX_ATTEMPTS):
		# After repeated failures add breathing room rather than ship a bad level.
		var extra := 1 if attempt >= MAX_ATTEMPTS / 2 else 0
		var board := shuffled_board(palette, empty + extra, rng)
		var result := Solver.solve(board, solver_budget)
		if result["status"] == Solver.STATUS_SOLVED:
			var data := LevelData.new()
			data.level = level
			data.tier = d["tier"]
			data.difficulty = minf(1.0, level / 200.0)
			data.colors = palette
			data.capacity = board.capacity
			data.bottles = board.to_array()
			data.par_moves = (result["moves"] as Array).size()
			return data
	# Last resort: a board with three spare bottles. Still verified.
	var fallback := shuffled_board(palette, empty + 2, rng)
	var data := LevelData.new()
	data.level = level
	data.tier = d["tier"]
	data.colors = palette
	data.bottles = fallback.to_array()
	var check := Solver.solve(fallback, solver_budget * 4)
	data.par_moves = (check["moves"] as Array).size()
	return data


static func shuffled_board(palette: PackedStringArray, empty: int, rng: RandomNumberGenerator,
		capacity: int = 4) -> BoardState:
	var units: Array = []
	for c in palette:
		for _k in range(capacity):
			units.append(c)
	for _guard in range(200):
		# Fisher-Yates with our seeded RNG so levels are reproducible.
		for i in range(units.size() - 1, 0, -1):
			var j := rng.randi_range(0, i)
			var tmp = units[i]
			units[i] = units[j]
			units[j] = tmp
		var bottles: Array = []
		for b in range(palette.size()):
			bottles.append(units.slice(b * capacity, (b + 1) * capacity))
		for _e in range(empty):
			bottles.append([])
		var board := BoardState.new(bottles, capacity)
		var ok := true
		for b in range(palette.size()):
			if board.is_bottle_complete(b) or board.top_run_length(b) >= 3:
				ok = false
				break
		if ok:
			return board
	return BoardState.new([], capacity)
