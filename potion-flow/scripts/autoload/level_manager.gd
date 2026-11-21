extends Node
## Supplies LevelData for any level number (autoload "LevelManager").
## Levels 1..N come from levels/level_NNN.json; beyond that they are generated
## deterministically and verified by the solver.

const MAX_LEVEL := 9999

var _cache := {}
var _prefetching := {}  # level -> WorkerThreadPool task id


func get_level(n: int) -> LevelData:
	n = clampi(n, 1, MAX_LEVEL)
	if _cache.has(n):
		return _cache[n]
	if _prefetching.has(n):
		WorkerThreadPool.wait_for_task_completion(_prefetching[n])
		_prefetching.erase(n)
		if _cache.has(n):
			return _cache[n]
	var data := load_from_file(n)
	if data == null:
		data = LevelGenerator.generate(n)
	_cache[n] = data
	return data


## Generates level `n` in the background so it is ready when the player gets there.
func prefetch(n: int) -> void:
	if n > MAX_LEVEL or _cache.has(n) or _prefetching.has(n) or has_file(n):
		return
	_prefetching[n] = WorkerThreadPool.add_task(func() -> void:
		var data := LevelGenerator.generate(n)
		_store_prefetched.call_deferred(n, data)
	)


func _store_prefetched(n: int, data: LevelData) -> void:
	if _prefetching.has(n):
		WorkerThreadPool.wait_for_task_completion(_prefetching[n])
		_prefetching.erase(n)
	if not _cache.has(n):
		_cache[n] = data


func _exit_tree() -> void:
	for n in _prefetching:
		WorkerThreadPool.wait_for_task_completion(_prefetching[n])
	_prefetching.clear()


func has_file(n: int) -> bool:
	return FileAccess.file_exists(LevelData.FILE_PATTERN % n)


func load_from_file(n: int) -> LevelData:
	return LevelData.load_level_file(n)


func tier_name(tier: String) -> String:
	return {"tutorial": "Apprentice", "easy": "Novice", "medium": "Adept",
		"hard": "Master", "advanced": "Archmage"}.get(tier, "Alchemist")
