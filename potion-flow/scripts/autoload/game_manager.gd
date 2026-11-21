extends Node
## App-level state and scene flow (autoload "GameManager").

signal state_changed(state: AppState)

enum AppState { HOME, PLAYING, BOTTLE_SELECTED, POURING, PAUSED, LEVEL_COMPLETED, SHOP, SETTINGS }

const MAIN_MENU := "res://scenes/MainMenu.tscn"
const GAME := "res://scenes/Game.tscn"

var state: AppState = AppState.HOME
## Level the game scene should open, and whether to restore a saved board.
var pending_level := 1
var resume_saved := false

var _fade_layer: CanvasLayer
var _fade: ColorRect
var _changing := false


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_fade_layer = CanvasLayer.new()
	_fade_layer.layer = 100
	add_child(_fade_layer)
	_fade = ColorRect.new()
	_fade.color = Color("#100B20")
	_fade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_fade.modulate.a = 0.0
	_fade_layer.add_child(_fade)


func set_state(s: AppState) -> void:
	if s == state:
		return
	state = s
	state_changed.emit(s)


func current_level() -> int:
	return int(SaveManager.get_value("progress", "current_level", 1))


func play_level(level: int, resume := false) -> void:
	pending_level = level
	resume_saved = resume
	set_state(AppState.PLAYING)
	change_scene(GAME)


func go_home() -> void:
	set_state(AppState.HOME)
	change_scene(MAIN_MENU)


## Fade out, swap scene, fade in. Input is blocked while fading.
func change_scene(path: String) -> void:
	if _changing:
		return
	_changing = true
	_fade.mouse_filter = Control.MOUSE_FILTER_STOP
	var tw := create_tween()
	tw.tween_property(_fade, "modulate:a", 1.0, 0.22)
	await tw.finished
	get_tree().change_scene_to_file(path)
	await get_tree().process_frame
	await get_tree().process_frame
	var tw2 := create_tween()
	tw2.tween_property(_fade, "modulate:a", 0.0, 0.28)
	await tw2.finished
	_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_changing = false


## Safe-area insets (notches, rounded corners) in viewport coordinates.
func safe_margins(viewport: Viewport) -> Dictionary:
	var vp := viewport.get_visible_rect().size
	var win := Vector2(DisplayServer.window_get_size())
	var safe := DisplayServer.get_display_safe_area()
	if win.x <= 0.0 or safe.size.x <= 0 or not OS.has_feature("mobile"):
		return {"top": 0.0, "bottom": 0.0, "left": 0.0, "right": 0.0}
	var sx := vp.x / win.x
	var sy := vp.y / win.y
	return {
		"top": maxf(0.0, safe.position.y * sy),
		"left": maxf(0.0, safe.position.x * sx),
		"bottom": maxf(0.0, (win.y - safe.end.y) * sy),
		"right": maxf(0.0, (win.x - safe.end.x) * sx),
	}
