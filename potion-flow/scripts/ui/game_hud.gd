class_name GameHUD
extends Control
## Top bar (home, level, coins, settings), progress meter and the bottom toolbar.

signal home_pressed
signal settings_pressed
signal undo_pressed
signal restart_pressed
signal hint_pressed
signal add_bottle_pressed

var undo_button: Button
var restart_button: Button
var hint_button: Button
var add_button: Button

var _level_label: Label
var _tier_label: Label
var _moves_label: Label
var _coin_label: Label
var _progress: ProgressBar
var _hint_badge: Label
var _bottle_badge: Label
var _tutorial: Label
var _top: Control
var _bottom: Control


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	theme = UIKit.get_theme()
	_build_top()
	_build_bottom()
	_tutorial = UIKit.make_label("", 28, UIKit.TEXT)
	_tutorial.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_tutorial.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_tutorial.set_anchors_preset(Control.PRESET_TOP_WIDE)
	_tutorial.offset_left = 40
	_tutorial.offset_right = -40
	_tutorial.add_theme_constant_override("outline_size", 6)
	_tutorial.add_theme_color_override("font_outline_color", Color(0.05, 0.02, 0.1))
	add_child(_tutorial)
	EconomyManager.coins_changed.connect(_on_coins_changed)
	EconomyManager.hints_changed.connect(_on_hints_changed)
	get_viewport().size_changed.connect(apply_safe_area)
	apply_safe_area()
	refresh_economy()


func _on_coins_changed(_total: int, _delta: int) -> void:
	refresh_economy()


func _on_hints_changed(_total: int) -> void:
	refresh_economy()


func _build_top() -> void:
	_top = Control.new()
	_top.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_top.set_anchors_preset(Control.PRESET_TOP_WIDE)
	_top.custom_minimum_size = Vector2(0, 150)
	_top.size = Vector2(720, 150)
	add_child(_top)

	var home := UIKit.make_icon_button("home", "", Color("#2C1F4A"), 84)
	_place(home, 0.0, 24.0, 20.0, Vector2(84, 84))
	home.pressed.connect(func() -> void: home_pressed.emit())
	_top.add_child(home)

	var gear := UIKit.make_icon_button("gear", "", Color("#2C1F4A"), 84)
	_place(gear, 0.0, 120.0, 20.0, Vector2(84, 84))
	gear.pressed.connect(func() -> void: settings_pressed.emit())
	_top.add_child(gear)

	var center := VBoxContainer.new()
	center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	center.alignment = BoxContainer.ALIGNMENT_CENTER
	_place(center, 0.5, -150.0, 10.0, Vector2(300, 130))
	center.add_theme_constant_override("separation", 2)
	_top.add_child(center)
	_level_label = UIKit.make_label("Level 1", 46, UIKit.TEXT, 8)
	_level_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	center.add_child(_level_label)
	_tier_label = UIKit.make_label("Apprentice", 22, UIKit.GOLD)
	_tier_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	center.add_child(_tier_label)
	_progress = ProgressBar.new()
	_progress.show_percentage = false
	_progress.custom_minimum_size = Vector2(240, 12)
	_progress.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	_progress.mouse_filter = Control.MOUSE_FILTER_IGNORE
	for pair in [["background", Color(1, 1, 1, 0.1)], ["fill", UIKit.CYAN]]:
		var st := UIKit.flat(pair[1], 6)
		st.content_margin_top = 0
		st.content_margin_bottom = 0
		st.content_margin_left = 0
		st.content_margin_right = 0
		_progress.add_theme_stylebox_override(pair[0], st)
	center.add_child(_progress)
	_moves_label = UIKit.make_label("Moves 0", 22, UIKit.TEXT_DIM)
	_moves_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	center.add_child(_moves_label)

	var coins := UIKit.coin_pill(EconomyManager.coins())
	_place(coins, 1.0, -204.0, 32.0, Vector2(180, 60))
	_top.add_child(coins)
	_coin_label = coins.find_child("Amount", true, false) as Label


## Anchor `c` horizontally at `anchor_x` (0 left, 0.5 centre, 1 right) of the top bar.
func _place(c: Control, anchor_x: float, x: float, y: float, sz: Vector2) -> void:
	c.anchor_left = anchor_x
	c.anchor_right = anchor_x
	c.anchor_top = 0.0
	c.anchor_bottom = 0.0
	c.offset_left = x
	c.offset_right = x + sz.x
	c.offset_top = y
	c.offset_bottom = y + sz.y


func _build_bottom() -> void:
	_bottom = HBoxContainer.new()
	_bottom.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_bottom.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	(_bottom as HBoxContainer).alignment = BoxContainer.ALIGNMENT_CENTER
	_bottom.add_theme_constant_override("separation", 34)
	_bottom.offset_top = -170
	_bottom.offset_bottom = -40
	add_child(_bottom)
	undo_button = UIKit.make_icon_button("undo", "Undo", Color("#3B2A66"))
	restart_button = UIKit.make_icon_button("restart", "Restart", Color("#3B2A66"))
	hint_button = UIKit.make_icon_button("hint", "Hint", Color("#6D3FD6"))
	add_button = UIKit.make_icon_button("bottle_add", "Bottle", Color("#6D3FD6"))
	for b in [undo_button, restart_button, hint_button, add_button]:
		b.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		_bottom.add_child(b)
	undo_button.pressed.connect(func() -> void: undo_pressed.emit())
	restart_button.pressed.connect(func() -> void: restart_pressed.emit())
	hint_button.pressed.connect(func() -> void: hint_pressed.emit())
	add_button.pressed.connect(func() -> void: add_bottle_pressed.emit())
	_hint_badge = UIKit.add_badge(hint_button, "3", UIKit.GREEN)
	_bottle_badge = UIKit.add_badge(add_button, str(EconomyManager.EXTRA_BOTTLE_COST), UIKit.GOLD.darkened(0.25))


func apply_safe_area() -> void:
	var m := GameManager.safe_margins(get_viewport())
	_top.offset_top = float(m["top"])
	_top.offset_bottom = float(m["top"]) + 150.0
	_bottom.offset_top = -170.0 - float(m["bottom"])
	_bottom.offset_bottom = -40.0 - float(m["bottom"])
	_tutorial.offset_top = 160.0 + float(m["top"])
	_tutorial.offset_bottom = 230.0 + float(m["top"])


## Vertical space (top, bottom) the board must leave free for the HUD.
func reserved() -> Vector2:
	var m := GameManager.safe_margins(get_viewport())
	var tut := 70.0 if _tutorial.text != "" else 0.0
	return Vector2(165.0 + float(m["top"]) + tut, 190.0 + float(m["bottom"]))


func set_level(level: int, tier: String) -> void:
	_level_label.text = "Level %d" % level
	_tier_label.text = LevelManager.tier_name(tier)


func set_moves(moves: int, par: int) -> void:
	_moves_label.text = "Moves %d  ·  Target %d" % [moves, par] if par > 0 else "Moves %d" % moves


func set_progress(done: int, total: int) -> void:
	_progress.max_value = maxi(1, total)
	var tw := create_tween()
	tw.tween_property(_progress, "value", float(done), 0.3).set_trans(Tween.TRANS_SINE)


func set_tutorial(text: String) -> void:
	_tutorial.text = text


func set_undo_enabled(enabled: bool) -> void:
	undo_button.modulate.a = 1.0 if enabled else 0.45


func set_add_enabled(enabled: bool) -> void:
	add_button.modulate.a = 1.0 if enabled else 0.45


func refresh_economy() -> void:
	if _coin_label:
		_coin_label.text = str(EconomyManager.coins())
	var tokens := EconomyManager.hint_tokens()
	if _hint_badge:
		_hint_badge.text = str(tokens) if tokens > 0 else str(EconomyManager.HINT_COST)
		_hint_badge.add_theme_stylebox_override("normal",
			UIKit.flat(UIKit.GREEN if tokens > 0 else UIKit.GOLD.darkened(0.25), 16))


func pulse_coins() -> void:
	if _coin_label == null:
		return
	var pill := _coin_label.get_parent().get_parent() as Control
	pill.pivot_offset = pill.size * 0.5
	var tw := create_tween()
	tw.tween_property(pill, "scale", Vector2(1.15, 1.15), 0.1)
	tw.tween_property(pill, "scale", Vector2.ONE, 0.2).set_trans(Tween.TRANS_BACK)


func coin_target_global() -> Vector2:
	if _coin_label == null:
		return Vector2(600, 60)
	return _coin_label.get_global_rect().get_center()
