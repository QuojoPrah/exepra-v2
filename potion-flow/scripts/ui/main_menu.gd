extends Control
## Home screen: logo, play/continue, level, coins, daily reward, shop,
## collection and settings over an animated magical backdrop.

static var _daily_shown_this_session := false

var _coin_label: Label
var _level_label: Label
var _continue_button: Button
var _play_button: Button
var _daily_badge: Label
var _emblem: BottleView
var _overlay: CanvasLayer
var _time := 0.0
var _content: Control


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	theme = UIKit.get_theme()
	var bg := MagicBackground.new()
	bg.floating_bottles = true
	add_child(bg)
	_content = Control.new()
	_content.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_content.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_content)
	_overlay = CanvasLayer.new()
	_overlay.layer = 10
	add_child(_overlay)
	_build()
	EconomyManager.coins_changed.connect(_on_coins_changed)
	SaveManager.changed.connect(_on_save_changed)
	get_viewport().size_changed.connect(_apply_safe_area)
	_apply_safe_area()
	_refresh()
	GameManager.set_state(GameManager.AppState.HOME)
	AudioManager.play_music()
	if RewardManager.can_claim() and not _daily_shown_this_session:
		_daily_shown_this_session = true
		get_tree().create_timer(0.6).timeout.connect(_open_daily)


func _on_coins_changed(_total: int, _delta: int) -> void:
	_refresh()


func _on_save_changed(_section: String) -> void:
	_refresh()


func _build() -> void:
	# Top bar.
	var pill := UIKit.coin_pill(EconomyManager.coins())
	_anchor(pill, 0.0, 28.0, 30.0, Vector2(190, 62))
	_content.add_child(pill)
	_coin_label = pill.find_child("Amount", true, false) as Label
	var gear := UIKit.make_icon_button("gear", "", Color("#2C1F4A"), 88)
	_anchor(gear, 1.0, -116.0, 18.0, Vector2(88, 88))
	gear.pressed.connect(_open_settings)
	_content.add_child(gear)

	# Logo + emblem bottle.
	var logo_box := VBoxContainer.new()
	logo_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	logo_box.alignment = BoxContainer.ALIGNMENT_CENTER
	logo_box.add_theme_constant_override("separation", -18)
	_anchor(logo_box, 0.5, -330.0, 140.0, Vector2(660, 260))
	_content.add_child(logo_box)
	for word in ["Potion", "Flow"]:
		var l := Label.new()
		l.text = word
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		var ls := LabelSettings.new()
		ls.font = UIKit.font(UIKit.FONT_LOGO)
		ls.font_size = 108 if word == "Potion" else 124
		ls.font_color = UIKit.GOLD if word == "Potion" else Color("#E9DDFF")
		ls.outline_size = 14
		ls.outline_color = Color("#3B1A7A")
		ls.shadow_size = 22
		ls.shadow_color = Color(UIKit.PURPLE, 0.55)
		ls.shadow_offset = Vector2(0, 6)
		l.label_settings = ls
		logo_box.add_child(l)

	_emblem = BottleView.new()
	_emblem.set_skin(Cosmetics.get_skin(SaveManager.get_value("cosmetics", "skin", "classic")))
	_emblem.set_contents(["pink", "violet", "cyan"])
	_emblem.scale = Vector2(0.95, 0.95)
	_emblem.complete_glow = 0.5
	add_child(_emblem)
	move_child(_emblem, 1)

	# Main actions.
	var actions := VBoxContainer.new()
	actions.add_theme_constant_override("separation", 18)
	actions.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_anchor_bottom(actions, -260.0, -520.0, Vector2(520, 300))
	_content.add_child(actions)
	_level_label = UIKit.make_label("Level 1", 34, UIKit.TEXT, 6)
	_level_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	actions.add_child(_level_label)
	_play_button = UIKit.make_button("Play", UIKit.GOLD, Vector2(520, 124), 50, "play")
	_play_button.pressed.connect(_on_play)
	actions.add_child(_play_button)
	_continue_button = UIKit.make_button("Continue", UIKit.VIOLET, Vector2(520, 92), 34)
	_continue_button.pressed.connect(_on_continue)
	actions.add_child(_continue_button)

	# Secondary row.
	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", 40)
	row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_anchor_bottom(row, -330.0, -200.0, Vector2(660, 128))
	_content.add_child(row)
	var daily := UIKit.make_icon_button("gift", "Daily", Color("#6D3FD6"), 124)
	daily.pressed.connect(_open_daily)
	row.add_child(daily)
	_daily_badge = UIKit.add_badge(daily, "!", UIKit.PINK)
	var shop := UIKit.make_icon_button("shop", "Shop", Color("#6D3FD6"), 124)
	shop.pressed.connect(func() -> void: _open_shop(false))
	row.add_child(shop)
	var coll := UIKit.make_icon_button("collection", "Bottles", Color("#6D3FD6"), 124)
	coll.pressed.connect(func() -> void: _open_shop(true))
	row.add_child(coll)

	var footer := UIKit.make_label("Sort the potions · Brew the flow", 22, UIKit.TEXT_DIM)
	footer.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_anchor_bottom(footer, -300.0, -60.0, Vector2(600, 40))
	_content.add_child(footer)


func _anchor(c: Control, ax: float, x: float, y: float, sz: Vector2) -> void:
	c.anchor_left = ax
	c.anchor_right = ax
	c.offset_left = x
	c.offset_right = x + sz.x
	c.offset_top = y
	c.offset_bottom = y + sz.y


func _anchor_bottom(c: Control, x: float, y: float, sz: Vector2) -> void:
	c.anchor_left = 0.5
	c.anchor_right = 0.5
	c.anchor_top = 1.0
	c.anchor_bottom = 1.0
	c.offset_left = x
	c.offset_right = x + sz.x
	c.offset_top = y
	c.offset_bottom = y + sz.y


func _apply_safe_area() -> void:
	var m := GameManager.safe_margins(get_viewport())
	_content.offset_top = float(m["top"])
	_content.offset_bottom = -float(m["bottom"])


func _process(delta: float) -> void:
	_time += delta
	if _emblem:
		var vp := get_viewport_rect().size
		var y := float(GameManager.safe_margins(get_viewport())["top"])
		# Between the logo and the play button; bobs gently.
		var free_top := y + 410.0
		var free_bottom := vp.y - 530.0 - float(GameManager.safe_margins(get_viewport())["bottom"])
		var avail := free_bottom - free_top
		var s := clampf((avail - 30.0) / 250.0, 0.4, 1.0)
		var cy := free_top + avail * 0.5 + BottleShape.HEIGHT * 0.5 * s
		_emblem.position = Vector2(vp.x * 0.5, cy + sin(_time * 1.4) * 8.0)
		_emblem.rotation = sin(_time * 0.9) * 0.05
		_emblem.scale = Vector2(s, s)
		_emblem.visible = avail > 110.0


func _refresh() -> void:
	if not is_inside_tree():
		return
	if _coin_label:
		_coin_label.text = str(EconomyManager.coins())
	var lvl := GameManager.current_level()
	_level_label.text = "Level %d · %s" % [lvl, LevelManager.tier_name(LevelGenerator.difficulty_for(lvl)["tier"])]
	_play_button.text = "Play  %d" % lvl
	var saved: Dictionary = SaveManager.get_value("progress", "in_progress", {})
	var has_saved := not saved.is_empty() and int(saved.get("moves", 0)) > 0
	_continue_button.visible = has_saved
	if has_saved:
		_continue_button.text = "Continue Level %d" % int(saved.get("level", lvl))
	_daily_badge.visible = RewardManager.can_claim()


func _on_play() -> void:
	var lvl := GameManager.current_level()
	var saved: Dictionary = SaveManager.get_value("progress", "in_progress", {})
	# Starting fresh discards a half-finished different level.
	if not saved.is_empty() and int(saved.get("level", -1)) != lvl:
		SaveManager.set_value("progress", "in_progress", {})
	GameManager.play_level(lvl, false)


func _on_continue() -> void:
	var saved: Dictionary = SaveManager.get_value("progress", "in_progress", {})
	GameManager.play_level(int(saved.get("level", GameManager.current_level())), true)


func _open_settings() -> void:
	_overlay.add_child(SettingsPanel.new())


func _open_shop(collection: bool) -> void:
	var shop := ShopPanel.new()
	shop.collection_mode = collection
	shop.closed.connect(func() -> void:
		_emblem.set_skin(Cosmetics.get_skin(SaveManager.get_value("cosmetics", "skin", "classic")))
	)
	_overlay.add_child(shop)


func _open_daily() -> void:
	var p := DailyRewardPanel.new()
	p.closed.connect(_refresh)
	_overlay.add_child(p)
