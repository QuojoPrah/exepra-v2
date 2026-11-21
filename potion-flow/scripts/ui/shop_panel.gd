class_name ShopPanel
extends Control
## Cosmetic shop (bottle skins and themes). Also serves as the bottle
## collection when opened with `collection_mode`.

signal closed

var initial_tab := "skins"
var collection_mode := false

var _grid: GridContainer
var _tab_buttons := {}
var _tab := "skins"
var _coin_label: Label


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	_tab = initial_tab
	var m := UIKit.make_modal("Collection" if collection_mode else "Shop", 660.0, true)
	add_child(m["root"])
	var body: VBoxContainer = m["body"]
	(m["close"] as Button).pressed.connect(close)

	var pill := UIKit.coin_pill(EconomyManager.coins())
	pill.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	_coin_label = pill.find_child("Amount", true, false) as Label
	body.add_child(pill)

	var tabs := HBoxContainer.new()
	tabs.add_theme_constant_override("separation", 12)
	body.add_child(tabs)
	for id in ["skins", "themes"]:
		var b := UIKit.make_button("Bottles" if id == "skins" else "Themes", Color("#3A2A5C"), Vector2(0, 72), 28)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.pressed.connect(func() -> void: _select_tab(id))
		tabs.add_child(b)
		_tab_buttons[id] = b

	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(590, 700)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	body.add_child(scroll)
	_grid = GridContainer.new()
	_grid.columns = 2
	_grid.add_theme_constant_override("h_separation", 16)
	_grid.add_theme_constant_override("v_separation", 16)
	_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(_grid)
	EconomyManager.coins_changed.connect(_on_coins)
	_select_tab(_tab)
	UIKit.pop_in(m["card"])


func _on_coins(total: int, _delta: int) -> void:
	if _coin_label:
		_coin_label.text = str(total)


func close() -> void:
	closed.emit()
	var tw := create_tween()
	tw.tween_property(self, "modulate:a", 0.0, 0.15)
	tw.tween_callback(queue_free)


func _select_tab(id: String) -> void:
	_tab = id
	for k in _tab_buttons:
		UIKit.style_button(_tab_buttons[k], UIKit.VIOLET if k == id else Color("#3A2A5C"), 28)
	_populate()


func _populate() -> void:
	for c in _grid.get_children():
		c.queue_free()
	var kind := "skin" if _tab == "skins" else "theme"
	var order: PackedStringArray = Cosmetics.SKIN_ORDER if _tab == "skins" else Cosmetics.THEME_ORDER
	for id in order:
		if collection_mode and not EconomyManager.owns(kind, id):
			continue
		_grid.add_child(_card(kind, id))


func _card(kind: String, id: String) -> Control:
	var item: Dictionary = Cosmetics.get_skin(id) if kind == "skin" else Cosmetics.get_theme(id)
	var card := PanelContainer.new()
	var equipped_id := String(SaveManager.get_value("cosmetics", kind, ""))
	var equipped := equipped_id == id
	card.add_theme_stylebox_override("panel", UIKit.flat(Color(1, 1, 1, 0.06), 24,
		UIKit.GOLD if equipped else Color(1, 1, 1, 0.12), 3 if equipped else 2))
	card.custom_minimum_size = Vector2(285, 0)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 8)
	card.add_child(v)

	var preview := CosmeticPreview.new()
	preview.custom_minimum_size = Vector2(250, 190)
	preview.kind = kind
	preview.item = item
	v.add_child(preview)

	var name_label := UIKit.make_label(String(item["name"]), 26, UIKit.TEXT)
	name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(name_label)

	var owned := EconomyManager.owns(kind, id)
	var btn: Button
	if equipped:
		btn = UIKit.make_button("Equipped", Color("#2E7D5B"), Vector2(0, 70), 26, "check")
	elif owned:
		btn = UIKit.make_button("Equip", UIKit.VIOLET, Vector2(0, 70), 26)
		btn.pressed.connect(func() -> void:
			EconomyManager.equip(kind, id)
			AudioManager.play("select")
			_populate()
		)
	else:
		btn = UIKit.make_button("   %d" % int(item["price"]), UIKit.GOLD, Vector2(0, 70), 26, "coin")
		btn.pressed.connect(func() -> void: _buy(kind, id, card))
	v.add_child(btn)
	return card


func _buy(kind: String, id: String, card: Control) -> void:
	if EconomyManager.buy_cosmetic(kind, id):
		EconomyManager.equip(kind, id)
		AudioManager.play("unlock")
		UIKit.toast(self, "Unlocked and equipped!", 200.0)
		_populate()
	else:
		AudioManager.play("error")
		UIKit.toast(self, "Not enough coins yet - keep brewing!", 200.0)
		var tw := card.create_tween()
		var x := card.position.x
		for k in range(4):
			tw.tween_property(card, "position:x", x + (8.0 if k % 2 == 0 else -8.0), 0.04)
		tw.tween_property(card, "position:x", x, 0.04)
