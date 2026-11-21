extends Node
## Local persistence (autoload "SaveManager").
## A single versioned JSON document in user:// written atomically. The layout is
## grouped into sections so it can later be synced to a cloud save as-is.

signal changed(section: String)

const SAVE_PATH := "user://potion_flow_save.json"
const SAVE_VERSION := 1

var data: Dictionary = {}
var save_path := SAVE_PATH  # tests point this somewhere else
var _dirty := false


static func defaults() -> Dictionary:
	return {
		"version": SAVE_VERSION,
		"progress": {
			"current_level": 1,      # next level to play
			"highest_unlocked": 1,
			"completed": {},         # "level" -> best stars
			"levels_completed": 0,
			"in_progress": {},       # saved board for Continue
		},
		"economy": {"coins": 150, "hint_tokens": 3, "lifetime_coins": 0},
		"cosmetics": {
			"skin": "classic", "theme": "purple",
			"owned_skins": ["classic"], "owned_themes": ["purple"],
		},
		"settings": {
			"music_volume": 0.6, "sfx_volume": 0.8,
			"music_muted": false, "sfx_muted": false,
			"vibration": true, "notifications": true, "language": "en",
			"low_effects": false,
		},
		"daily": {"last_claim_day": -1, "last_claim_unix": 0, "streak": 0},
		"meta": {"created_unix": int(Time.get_unix_time_from_system()), "play_sessions": 0},
	}


func _ready() -> void:
	load_game()
	data["meta"]["play_sessions"] = int(data["meta"].get("play_sessions", 0)) + 1
	save_game()


func _notification(what: int) -> void:
	# Mobile apps are usually killed from the background, so flush on pause too.
	if what == NOTIFICATION_WM_CLOSE_REQUEST or what == NOTIFICATION_APPLICATION_PAUSED \
			or what == NOTIFICATION_APPLICATION_FOCUS_OUT:
		if _dirty:
			save_game()


func load_game() -> void:
	data = defaults()
	if not FileAccess.file_exists(save_path):
		return
	var f := FileAccess.open(save_path, FileAccess.READ)
	if f == null:
		push_warning("SaveManager: cannot open save, using defaults")
		return
	var parsed = JSON.parse_string(f.get_as_text())
	if parsed is Dictionary:
		data = _merge(defaults(), migrate(parsed))
	else:
		push_warning("SaveManager: save file corrupt, using defaults")


## Upgrade older save layouts. Add a branch per version bump.
func migrate(d: Dictionary) -> Dictionary:
	var v := int(d.get("version", 0))
	if v < 1:
		d["version"] = 1
	return d


func save_game() -> void:
	var tmp := save_path + ".tmp"
	var f := FileAccess.open(tmp, FileAccess.WRITE)
	if f == null:
		push_error("SaveManager: cannot write save (%s)" % error_string(FileAccess.get_open_error()))
		return
	f.store_string(JSON.stringify(data, "\t"))
	f.close()
	var err := DirAccess.rename_absolute(tmp, save_path)
	if err != OK:
		# Some platforms refuse to rename over an existing file.
		DirAccess.remove_absolute(save_path)
		DirAccess.rename_absolute(tmp, save_path)
	_dirty = false


func get_value(section_name: String, key: String, default_value: Variant = null) -> Variant:
	var s: Dictionary = data.get(section_name, {})
	return s.get(key, default_value)


func set_value(section_name: String, key: String, value: Variant, persist := true) -> void:
	if not data.has(section_name):
		data[section_name] = {}
	data[section_name][key] = value
	_dirty = true
	if persist:
		save_game()
	changed.emit(section_name)


func section(section_name: String) -> Dictionary:
	if not data.has(section_name):
		data[section_name] = {}
	return data[section_name]


func commit(section_name: String) -> void:
	_dirty = true
	save_game()
	changed.emit(section_name)


func reset_progress() -> void:
	var keep_settings: Dictionary = data.get("settings", {}).duplicate(true)
	data = defaults()
	data["settings"] = _merge(data["settings"], keep_settings)
	save_game()
	for s in ["progress", "economy", "cosmetics", "daily", "settings"]:
		changed.emit(s)


## Recursively fill `base` with values from `over` (keeps new default keys).
static func _merge(base: Dictionary, over: Dictionary) -> Dictionary:
	var out := base.duplicate(true)
	for k in over:
		if out.has(k) and out[k] is Dictionary and over[k] is Dictionary and not (out[k] as Dictionary).is_empty():
			out[k] = _merge(out[k], over[k])
		else:
			out[k] = over[k]
	return out
