class_name Solver
extends RefCounted
## Depth-first search with memoisation over BoardState.
## Used for hints, for verifying generated levels and in the test suite.
## Mirrors tools/level_tool.py (solve_dfs / ordered_moves).

const STATUS_SOLVED := "solved"
const STATUS_UNSOLVABLE := "unsolvable"
const STATUS_UNKNOWN := "unknown"


## Pruned legal moves, most promising first.
static func ordered_moves(state: BoardState) -> Array[Vector2i]:
	var scored: Array = []
	var n := state.bottle_count()
	for a in range(n):
		if state.is_empty(a) or state.is_bottle_complete(a):
			continue
		var run := state.top_run_length(a)
		var used_empty := false
		for b in range(n):
			if not state.can_pour(a, b):
				continue
			var score := 0
			if state.is_empty(b):
				# Moving a single-colour bottle into an empty one changes nothing,
				# and all empty bottles are interchangeable.
				if state.is_uniform(a) or used_empty:
					continue
				used_empty = true
			else:
				var amount := mini(run, state.free_space(b))
				score = 2
				if amount == run:
					score += 2
				if state.fill(b) + amount == state.capacity and state.is_uniform(b):
					score += 4
			scored.append([-score, a, b])
	# Same ordering as the Python tuple sort: score, then source, then target.
	scored.sort_custom(func(x: Array, y: Array) -> bool:
		for k in range(3):
			if x[k] != y[k]:
				return x[k] < y[k]
		return false
	)
	var out: Array[Vector2i] = []
	for s in scored:
		out.append(Vector2i(s[1], s[2]))
	return out


## Returns {"status": String, "moves": Array[Vector2i], "explored": int}.
static func solve(start: BoardState, max_nodes: int = 40000) -> Dictionary:
	var empty_moves: Array[Vector2i] = []
	if start.is_solved():
		return {"status": STATUS_SOLVED, "moves": empty_moves, "explored": 0}
	var visited := {start.key(): true}
	var path: Array[Vector2i] = []
	var stack: Array = [{"state": start, "moves": ordered_moves(start), "i": 0}]
	var explored := 0
	while not stack.is_empty():
		var frame: Dictionary = stack[stack.size() - 1]
		var moves: Array[Vector2i] = frame["moves"]
		var i: int = frame["i"]
		if i >= moves.size():
			stack.pop_back()
			if not path.is_empty():
				path.pop_back()
			continue
		frame["i"] = i + 1
		var mv: Vector2i = moves[i]
		var next: BoardState = (frame["state"] as BoardState).clone()
		next.pour(mv.x, mv.y)
		var k := next.key()
		if visited.has(k):
			continue
		visited[k] = true
		explored += 1
		path.append(mv)
		if next.is_solved():
			return {"status": STATUS_SOLVED, "moves": path.duplicate(), "explored": explored}
		if explored >= max_nodes:
			return {"status": STATUS_UNKNOWN, "moves": empty_moves, "explored": explored}
		stack.append({"state": next, "moves": ordered_moves(next), "i": 0})
	return {"status": STATUS_UNSOLVABLE, "moves": empty_moves, "explored": explored}


## Best move to suggest from the current state.
## Returns {"move": Vector2i, "kind": "solution"|"heuristic"|"stuck"}.
static func hint(state: BoardState, max_nodes: int = 25000) -> Dictionary:
	var result := solve(state, max_nodes)
	if result["status"] == STATUS_SOLVED and not (result["moves"] as Array).is_empty():
		return {"move": result["moves"][0], "kind": "solution"}
	if result["status"] == STATUS_UNSOLVABLE:
		return {"move": Vector2i(-1, -1), "kind": "stuck"}
	var moves := ordered_moves(state)
	if moves.is_empty():
		return {"move": Vector2i(-1, -1), "kind": "stuck"}
	return {"move": moves[0], "kind": "heuristic"}
