class_name LevelData
extends RefCounted
## One puzzle definition, loaded from levels/level_NNN.json or generated.

const FILE_PATTERN := "res://levels/level_%03d.json"

var level: int = 1
var tier: String = "tutorial"
var difficulty: float = 0.0
var colors: PackedStringArray = []
var capacity: int = 4
var bottles: Array = []
var par_moves: int = 0
var tutorial: String = ""
## Reserved for special mechanics (locked bottles, hidden layers, move limits...).
## Keys are mechanic ids; values are mechanic-specific configuration.
var mechanics: Dictionary = {}


static func from_dict(d: Dictionary) -> LevelData:
	var data := LevelData.new()
	data.level = int(d.get("level", 1))
	data.tier = String(d.get("tier", "tutorial"))
	data.difficulty = float(d.get("difficulty", 0.0))
	data.capacity = int(d.get("bottle_capacity", 4))
	data.par_moves = int(d.get("par_moves", 0))
	data.tutorial = String(d.get("tutorial", ""))
	data.mechanics = d.get("mechanics", {})
	for c in d.get("colors", []):
		data.colors.append(String(c))
	for b in d.get("bottles", []):
		var bottle: Array = []
		for c in b:
			bottle.append(String(c))
		data.bottles.append(bottle)
	return data


## Loads levels/level_NNN.json; returns null if missing or invalid.
static func load_level_file(n: int) -> LevelData:
	var path := FILE_PATTERN % n
	if not FileAccess.file_exists(path):
		return null
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		return null
	var parsed = JSON.parse_string(f.get_as_text())
	if not parsed is Dictionary:
		push_error("LevelData: %s is not valid JSON" % path)
		return null
	var data := LevelData.from_dict(parsed)
	var errors := data.validate()
	if not errors.is_empty():
		push_error("LevelData: %s invalid: %s" % [path, ", ".join(errors)])
		return null
	return data


func to_dict() -> Dictionary:
	return {
		"level": level,
		"tier": tier,
		"difficulty": difficulty,
		"colors": Array(colors),
		"bottle_capacity": capacity,
		"par_moves": par_moves,
		"tutorial": tutorial,
		"mechanics": mechanics,
		"bottles": bottles.duplicate(true),
	}


func create_board() -> BoardState:
	return BoardState.new(bottles, capacity)


## Returns a list of problems; empty means the data is structurally valid.
func validate() -> PackedStringArray:
	var errors: PackedStringArray = []
	var counts := {}
	for b in bottles:
		if (b as Array).size() > capacity:
			errors.append("bottle over capacity")
		for c in b:
			if not PotionColors.has(c):
				errors.append("unknown colour %s" % c)
			counts[c] = int(counts.get(c, 0)) + 1
	for c in counts:
		if counts[c] != capacity:
			errors.append("colour %s has %d units" % [c, counts[c]])
	if bottles.is_empty():
		errors.append("no bottles")
	return errors
