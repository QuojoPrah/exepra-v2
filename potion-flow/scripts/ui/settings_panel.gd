class_name SettingsPanel
extends Control
## Settings: audio, vibration, effects quality, language, notifications,
## legal pages and progress reset. Every control writes straight to the save.

signal closed

const LANGUAGES := [["en", "English"]]  # more locales once translations exist

var _modal: Dictionary


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_modal = UIKit.make_modal("Settings", 640.0, true)
	add_child(_modal["root"])
	var body: VBoxContainer = _modal["body"]
	(_modal["close"] as Button).pressed.connect(close)

	body.add_child(_slider_row("Music", "music_volume", "music_muted"))
	body.add_child(_slider_row("Sound", "sfx_volume", "sfx_muted"))
	body.add_child(_toggle_row("Vibration", "vibration"))
	body.add_child(_toggle_row("Reduced effects", "low_effects"))
	body.add_child(_toggle_row("Notifications", "notifications"))

	var lang_row := _row("Language")
	var lang := OptionButton.new()
	lang.custom_minimum_size = Vector2(220, 70)
	lang.focus_mode = Control.FOCUS_NONE
	lang.add_theme_font_size_override("font_size", 26)
	for k in range(LANGUAGES.size()):
		lang.add_item(LANGUAGES[k][1], k)
	lang.item_selected.connect(func(idx: int) -> void:
		SaveManager.set_value("settings", "language", LANGUAGES[idx][0])
	)
	lang_row.add_child(lang)
	body.add_child(lang_row)

	var links := HBoxContainer.new()
	links.add_theme_constant_override("separation", 14)
	var privacy := UIKit.make_button("Privacy", Color("#3A2A5C"), Vector2(0, 76), 26)
	var terms := UIKit.make_button("Terms", Color("#3A2A5C"), Vector2(0, 76), 26)
	privacy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	terms.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	privacy.pressed.connect(func() -> void: _show_text("Privacy Policy", LegalText.PRIVACY))
	terms.pressed.connect(func() -> void: _show_text("Terms of Service", LegalText.TERMS))
	links.add_child(privacy)
	links.add_child(terms)
	body.add_child(links)

	var reset := UIKit.make_button("Reset Progress", Color("#8A1F33"), Vector2(0, 80), 28)
	reset.pressed.connect(_confirm_reset)
	body.add_child(reset)
	var ver: String = ProjectSettings.get_setting("application/config/version", "0.1")
	var version := UIKit.make_label("Potion Flow v%s" % ver, 20, UIKit.TEXT_DIM)
	version.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	body.add_child(version)
	UIKit.pop_in(_modal["card"])


func _confirm_reset() -> void:
	UIKit.confirm(self, "Reset progress?",
		"All levels, coins and unlocked cosmetics will be erased. This cannot be undone.",
		"Reset", _do_reset, true)


func _do_reset() -> void:
	SaveManager.reset_progress()
	UIKit.toast(self, "Progress reset")


func close() -> void:
	closed.emit()
	var tw := create_tween()
	tw.tween_property(self, "modulate:a", 0.0, 0.15)
	tw.tween_callback(queue_free)


func _row(label: String) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 16)
	var l := UIKit.make_label(label, 30, UIKit.TEXT)
	l.custom_minimum_size = Vector2(230, 0)
	l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(l)
	return row


func _slider_row(label: String, key: String, mute_key: String) -> HBoxContainer:
	var row := _row(label)
	var slider := HSlider.new()
	slider.min_value = 0.0
	slider.max_value = 1.0
	slider.step = 0.05
	slider.value = float(SaveManager.get_value("settings", key, 0.7))
	slider.custom_minimum_size = Vector2(230, 56)
	slider.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	slider.focus_mode = Control.FOCUS_NONE
	slider.value_changed.connect(func(v: float) -> void:
		SaveManager.set_value("settings", key, v, false)
	)
	slider.drag_ended.connect(func(_changed: bool) -> void: SaveManager.save_game())
	row.add_child(slider)
	row.add_child(_switch(mute_key, true))
	return row


func _toggle_row(label: String, key: String) -> HBoxContainer:
	var row := _row(label)
	row.add_child(_switch(key, false))
	return row


## A pill switch. `inverted` shows ON when the stored flag is false (mute keys).
func _switch(key: String, inverted: bool) -> Button:
	var b := Button.new()
	b.toggle_mode = true
	b.focus_mode = Control.FOCUS_NONE
	b.custom_minimum_size = Vector2(110, 60)
	var stored := bool(SaveManager.get_value("settings", key, false))
	b.button_pressed = stored != inverted
	var update := func() -> void:
		var on := b.button_pressed
		b.text = "ON" if on else "OFF"
		UIKit.style_button(b, UIKit.GREEN.darkened(0.2) if on else Color("#3A2A5C"), 24)
	update.call()
	b.toggled.connect(func(on: bool) -> void:
		SaveManager.set_value("settings", key, on != inverted)
		update.call()
	)
	UIKit.add_juice(b)
	return b


func _show_text(title: String, text: String) -> void:
	var m := UIKit.make_modal(title, 640.0, true)
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(560, 640)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	var l := UIKit.make_label(text, 24, UIKit.TEXT)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.custom_minimum_size = Vector2(540, 0)
	scroll.add_child(l)
	m["body"].add_child(scroll)
	var root: Control = m["root"]
	(m["close"] as Button).pressed.connect(func() -> void: UIKit.close_modal(root))
	add_child(root)
	UIKit.pop_in(m["card"])
